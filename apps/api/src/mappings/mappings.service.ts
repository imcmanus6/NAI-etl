import { Injectable, NotFoundException } from '@nestjs/common';
import type { CanonicalSchema } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { recordAudit } from '@etl/audit';
import { isLlmAvailable } from '@etl/ai-service';
import { suggestMappings, type Suggestion } from './heuristics.js';

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

  async suggest(
    tenantId: string,
    input: { sourceSchemaId: string; targetSchemaId: string; projectId?: string },
    actorId?: string,
  ) {
    const [source, target] = await Promise.all([
      this.loadSchema(tenantId, input.sourceSchemaId),
      this.loadSchema(tenantId, input.targetSchemaId),
    ]);

    const { suggestions, unmappedSources, missingRequiredTargets } = suggestMappings(source, target);
    // The LLM (when configured) would refine here; the deterministic engine is
    // always the backbone so the feature works offline and is reproducible.
    const generatedBy = isLlmAvailable() ? 'heuristic+llm-available' : 'heuristic';

    // Persist each suggestion as an AiSuggestion (draft).
    const persisted = await Promise.all(
      suggestions.map((s) =>
        prisma.aiSuggestion.create({
          data: {
            tenantId,
            projectId: input.projectId ?? null,
            kind: 'mapping',
            status: 'proposed',
            payload: {
              ...s,
              sourceSchemaId: input.sourceSchemaId,
              targetSchemaId: input.targetSchemaId,
            } as object,
          },
        }),
      ),
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
