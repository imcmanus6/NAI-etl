import { Injectable, NotFoundException } from '@nestjs/common';
import type { CanonicalSchema } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { recordAudit } from '@etl/audit';
import { isLlmAvailable } from '@etl/ai-service';
import { parseDocGlossary, glossaryMap } from '@etl/schema-discovery';
import { suggestMappings, type Suggestion } from './heuristics.js';
import { suggestValidations } from '../versions/validation-suggester.js';
import { suggestTransformations } from '../versions/transformation-suggester.js';

interface StoredMappingPayload extends Suggestion {
  sourceSchemaId: string;
  targetSchemaId: string;
}

/**
 * Mapping suggestion + review service (Phase 4).
 *
 * Suggestions are advisory drafts. Accepting one promotes it into DETERMINISTIC
 * FieldMapping config on the project's draft version — the point at which AI
 * output becomes reviewable, versioned configuration.
 */
@Injectable()
export class MappingsService {
  private async loadSchema(tenantId: string, id: string): Promise<CanonicalSchema> {
    const row = await prisma.schemaModel.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException(`Schema ${id} not found`);
    return row.model as unknown as CanonicalSchema;
  }

  /** Build a field-name → definition glossary from a project's reference docs. */
  private async glossaryFor(tenantId: string, projectId?: string): Promise<Record<string, string>> {
    if (!projectId) return {};
    const docs = await prisma.projectDocument.findMany({ where: { tenantId, projectId } });
    const entries = docs.flatMap((d) => parseDocGlossary(d.content));
    return glossaryMap(entries);
  }

  private async persistMappingSuggestions(
    tenantId: string,
    projectId: string | undefined,
    sourceSchemaId: string,
    targetSchemaId: string,
    suggestions: Suggestion[],
  ) {
    return Promise.all(
      suggestions.map((s) =>
        prisma.aiSuggestion.create({
          data: {
            tenantId,
            projectId: projectId ?? null,
            kind: 'mapping',
            status: 'proposed',
            payload: { ...s, sourceSchemaId, targetSchemaId } as object,
          },
        }),
      ),
    );
  }

  async suggest(
    tenantId: string,
    input: { sourceSchemaId: string; targetSchemaId: string; projectId?: string },
    actorId?: string,
  ) {
    const [source, target, glossary] = await Promise.all([
      this.loadSchema(tenantId, input.sourceSchemaId),
      this.loadSchema(tenantId, input.targetSchemaId),
      this.glossaryFor(tenantId, input.projectId),
    ]);

    const { suggestions, unmappedSources, missingRequiredTargets } = suggestMappings(source, target, glossary);
    const docTerms = Object.keys(glossary).length;
    // The LLM (when configured) would refine here; the deterministic engine is
    // always the backbone so the feature works offline and is reproducible.
    const generatedBy = `${isLlmAvailable() ? 'heuristic+llm-available' : 'heuristic'}${docTerms ? `+docs(${docTerms})` : ''}`;

    const persisted = await this.persistMappingSuggestions(
      tenantId,
      input.projectId,
      input.sourceSchemaId,
      input.targetSchemaId,
      suggestions,
    );

    if (input.projectId) {
      await recordAudit({
        lineage: { tenantId, projectId: input.projectId },
        actorId,
        action: 'mapping.suggestions.generated',
        subjectType: 'Project',
        subjectId: input.projectId,
        after: { count: persisted.length, generatedBy },
      });
    }

    return {
      generatedBy,
      unmappedSources,
      missingRequiredTargets,
      suggestions: persisted.map((row) => ({ id: row.id, status: row.status, ...(row.payload as object) })),
    };
  }

  /**
   * One-shot transformation-layer generation: from a source file/schema + its
   * documentation + the target, produce a complete proposed layer — mappings,
   * value transformations, and validations — all as reviewable draft
   * suggestions (never code, never auto-deployed).
   */
  async generateLayer(
    tenantId: string,
    projectId: string,
    sourceSchemaId: string,
    targetSchemaId: string,
    actorId?: string,
  ) {
    const [source, target, glossary] = await Promise.all([
      this.loadSchema(tenantId, sourceSchemaId),
      this.loadSchema(tenantId, targetSchemaId),
      this.glossaryFor(tenantId, projectId),
    ]);

    const mapping = suggestMappings(source, target, glossary);
    const transformations = suggestTransformations(
      mapping.suggestions.map((s) => ({
        targetField: s.targetField,
        sourceField: s.sourceField,
        mappingType: s.mappingType,
        risks: s.risks,
      })),
    );
    const validations = suggestValidations(target);

    // Persist all three kinds as reviewable suggestions.
    const persistedMappings = await this.persistMappingSuggestions(
      tenantId,
      projectId,
      sourceSchemaId,
      targetSchemaId,
      mapping.suggestions,
    );
    await Promise.all([
      ...transformations.map((t) =>
        prisma.aiSuggestion.create({ data: { tenantId, projectId, kind: 'transformation', status: 'proposed', payload: t as object } }),
      ),
      ...validations.map((v) =>
        prisma.aiSuggestion.create({ data: { tenantId, projectId, kind: 'validation', status: 'proposed', payload: v as object } }),
      ),
    ]);

    await recordAudit({
      lineage: { tenantId, projectId },
      actorId,
      action: 'layer.generated',
      subjectType: 'Project',
      subjectId: projectId,
      after: { mappings: mapping.suggestions.length, transformations: transformations.length, validations: validations.length },
    });

    return {
      docTermsUsed: Object.keys(glossary).length,
      summary: {
        mappings: mapping.suggestions.length,
        transformations: transformations.length,
        validations: validations.length,
        unmappedSources: mapping.unmappedSources.length,
        missingRequiredTargets: mapping.missingRequiredTargets.length,
      },
      mappings: persistedMappings.map((row) => ({ id: row.id, status: row.status, ...(row.payload as object) })),
      transformations,
      validations,
      unmappedSources: mapping.unmappedSources,
      missingRequiredTargets: mapping.missingRequiredTargets,
    };
  }

  async listSuggestions(tenantId: string, projectId: string) {
    const rows = await prisma.aiSuggestion.findMany({
      where: { tenantId, projectId, kind: 'mapping' },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => ({ id: row.id, status: row.status, ...(row.payload as object) }));
  }

  async feedback(
    tenantId: string,
    suggestionId: string,
    decision: 'accepted' | 'rejected' | 'modified',
    editedPayload: unknown,
    userId?: string,
  ) {
    const suggestion = await prisma.aiSuggestion.findFirst({ where: { id: suggestionId, tenantId } });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    await prisma.$transaction([
      prisma.aiSuggestion.update({ where: { id: suggestionId }, data: { status: decision } }),
      prisma.aiFeedback.create({
        data: {
          tenantId,
          suggestionId,
          userId: userId ?? null,
          decision,
          editedPayload: (editedPayload ?? undefined) as object | undefined,
        },
      }),
    ]);

    // Promote accepted/modified suggestions into deterministic draft config.
    let promotedTo: string | null = null;
    if ((decision === 'accepted' || decision === 'modified') && suggestion.projectId) {
      const payload = {
        ...(suggestion.payload as unknown as StoredMappingPayload),
        ...((editedPayload as object) ?? {}),
      };
      promotedTo = await this.promoteToDraft(tenantId, suggestion.projectId, suggestionId, payload, userId);
    }

    return { status: decision, promotedToVersionId: promotedTo };
  }

  /** Get-or-create the project's draft version and add/replace the field mapping. */
  private async promoteToDraft(
    tenantId: string,
    projectId: string,
    suggestionId: string,
    payload: StoredMappingPayload,
    userId?: string,
  ): Promise<string> {
    let draft = await prisma.projectVersion.findFirst({
      where: { tenantId, projectId, status: 'draft' },
      orderBy: { versionNumber: 'desc' },
    });
    if (!draft) {
      const last = await prisma.projectVersion.findFirst({
        where: { projectId },
        orderBy: { versionNumber: 'desc' },
      });
      draft = await prisma.projectVersion.create({
        data: {
          tenantId,
          projectId,
          versionNumber: (last?.versionNumber ?? 0) + 1,
          status: 'draft',
          createdBy: userId ?? null,
          mappings: [],
        },
      });
    }

    const [srcEntity, srcField] = (payload.sourceField ?? '.').split('.');
    const [tgtEntity, tgtField] = payload.targetField.split('.');
    const fieldMapping = {
      id: `fm-${suggestionId}`,
      type: payload.mappingType,
      sources: payload.sourceField ? [{ entity: srcEntity, field: srcField }] : [],
      targets: [{ entity: tgtEntity, field: tgtField }],
      potentiallyDestructive: false,
      originSuggestionId: suggestionId,
    };

    const current = Array.isArray(draft.mappings) ? (draft.mappings as unknown[]) : [];
    const next = [
      ...current.filter((m) => (m as { targets?: Array<{ field: string }> }).targets?.[0]?.field !== tgtField),
      fieldMapping,
    ];

    await prisma.projectVersion.update({ where: { id: draft.id }, data: { mappings: next as object } });
    await recordAudit({
      lineage: { tenantId, projectId, projectVersionId: draft.id },
      actorId: userId,
      action: 'mapping.accepted',
      subjectType: 'ProjectVersion',
      subjectId: draft.id,
      after: { targetField: payload.targetField, mappingType: payload.mappingType },
    });
    return draft.id;
  }
}
