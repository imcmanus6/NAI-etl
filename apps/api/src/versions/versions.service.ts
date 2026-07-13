import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CanonicalSchema } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { recordAudit } from '@etl/audit';
import { ObjectStore, loadStorageConfig } from '@etl/storage';
import { suggestValidations } from './validation-suggester.js';
import { suggestTransformations, type MappingRiskInput } from './transformation-suggester.js';
import { generateMappingDocument } from './document.js';

type Json = Record<string, unknown>;

/**
 * Draft configuration + version lifecycle (Phases 5–6).
 *
 * A project's working config lives on its DRAFT version. Submitting locks it for
 * approval; approving deploys it and makes it immutable. Deployed versions are
 * never mutated — changes fork a new draft.
 */
@Injectable()
export class VersionsService {
  private async assertProject(tenantId: string, projectId: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getOrCreateDraft(tenantId: string, projectId: string, userId?: string) {
    await this.assertProject(tenantId, projectId);
    const draft = await prisma.projectVersion.findFirst({
      where: { tenantId, projectId, status: 'draft' },
      orderBy: { versionNumber: 'desc' },
    });
    if (draft) return draft;
    const last = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });
    return prisma.projectVersion.create({
      data: {
        tenantId,
        projectId,
        versionNumber: (last?.versionNumber ?? 0) + 1,
        status: 'draft',
        createdBy: userId ?? null,
      },
    });
  }

  listVersions(tenantId: string, projectId: string) {
    return prisma.projectVersion.findMany({
      where: { tenantId, projectId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        status: true,
        deployedAt: true,
        createdAt: true,
        mappings: true,
        validations: true,
      },
    });
  }

  async getVersion(tenantId: string, versionId: string) {
    const v = await prisma.projectVersion.findFirst({ where: { id: versionId, tenantId } });
    if (!v) throw new NotFoundException('Version not found');
    return v;
  }

  private async draftOrThrow(tenantId: string, projectId: string) {
    const draft = await prisma.projectVersion.findFirst({
      where: { tenantId, projectId, status: 'draft' },
      orderBy: { versionNumber: 'desc' },
    });
    if (!draft) throw new BadRequestException('No draft version — accept some mappings first');
    return draft;
  }

  // --- Validations ----------------------------------------------------------

  async suggestValidations(tenantId: string, projectId: string, targetSchemaId: string, userId?: string) {
    const schemaRow = await prisma.schemaModel.findFirst({ where: { id: targetSchemaId, tenantId } });
    if (!schemaRow) throw new NotFoundException('Target schema not found');
    const schema = schemaRow.model as unknown as CanonicalSchema;
    const suggestions = suggestValidations(schema);

    const persisted = await Promise.all(
      suggestions.map((s) =>
        prisma.aiSuggestion.create({
          data: { tenantId, projectId, kind: 'validation', status: 'proposed', payload: s as object },
        }),
      ),
    );
    void userId;
    return persisted.map((r) => ({ id: r.id, status: r.status, ...(r.payload as object) }));
  }

  async listConfigSuggestions(tenantId: string, projectId: string, kind: 'validation' | 'transformation') {
    const rows = await prisma.aiSuggestion.findMany({
      where: { tenantId, projectId, kind },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({ id: r.id, status: r.status, ...(r.payload as object) }));
  }

  /** Derive transformation suggestions from this project's accepted mappings. */
  async suggestTransformations(tenantId: string, projectId: string) {
    const mappingSuggestions = await prisma.aiSuggestion.findMany({
      where: { tenantId, projectId, kind: 'mapping', status: { in: ['accepted', 'modified'] } },
    });
    const inputs: MappingRiskInput[] = mappingSuggestions.map((row) => {
      const p = row.payload as Json;
      return {
        targetField: String(p.targetField),
        sourceField: (p.sourceField as string) ?? null,
        mappingType: String(p.mappingType),
        risks: Array.isArray(p.risks) ? (p.risks as string[]) : [],
      };
    });
    const suggestions = suggestTransformations(inputs);
    const persisted = await Promise.all(
      suggestions.map((s) =>
        prisma.aiSuggestion.create({
          data: { tenantId, projectId, kind: 'transformation', status: 'proposed', payload: s as object },
        }),
      ),
    );
    return persisted.map((r) => ({ id: r.id, status: r.status, ...(r.payload as object) }));
  }

  /** Accept/reject a validation or transformation suggestion into the draft. */
  async decideConfigSuggestion(
    tenantId: string,
    suggestionId: string,
    decision: 'accepted' | 'rejected',
    userId?: string,
  ) {
    const suggestion = await prisma.aiSuggestion.findFirst({ where: { id: suggestionId, tenantId } });
    if (!suggestion) throw new NotFoundException('Suggestion not found');
    if (!suggestion.projectId) throw new BadRequestException('Suggestion not tied to a project');

    await prisma.$transaction([
      prisma.aiSuggestion.update({ where: { id: suggestionId }, data: { status: decision } }),
      prisma.aiFeedback.create({ data: { tenantId, suggestionId, userId: userId ?? null, decision } }),
    ]);

    if (decision !== 'accepted') return { status: decision };

    const draft = await this.getOrCreateDraft(tenantId, suggestion.projectId, userId);
    const payload = suggestion.payload as Json;

    if (suggestion.kind === 'validation') {
      const rules = Array.isArray(draft.validations) ? (draft.validations as Json[]) : [];
      const rule = { id: `vr-${suggestionId}`, ...payload };
      const next = [
        ...rules.filter(
          (r) => !(r.ruleType === payload.ruleType && JSON.stringify(r.fields) === JSON.stringify(payload.fields)),
        ),
        rule,
      ];
      await prisma.projectVersion.update({ where: { id: draft.id }, data: { validations: next as object } });
    } else if (suggestion.kind === 'transformation') {
      const targetField = String(payload.targetField).split('.').pop();
      const mappings = Array.isArray(draft.mappings) ? (draft.mappings as Json[]) : [];
      const next = mappings.map((m) => {
        const t = (m.targets as Array<{ field: string }> | undefined)?.[0]?.field;
        if (t === targetField) {
          return { ...m, transformation: { id: `tx-${suggestionId}`, steps: payload.steps, explanation: payload.explanation } };
        }
        return m;
      });
      await prisma.projectVersion.update({ where: { id: draft.id }, data: { mappings: next as object } });
    }

    await recordAudit({
      lineage: { tenantId, projectId: suggestion.projectId, projectVersionId: draft.id },
      actorId: userId,
      action: `${suggestion.kind}.accepted`,
      subjectType: 'ProjectVersion',
      subjectId: draft.id,
      after: { kind: suggestion.kind },
    });
    return { status: decision, draftVersionId: draft.id };
  }

  // --- Lifecycle ------------------------------------------------------------

  async submitForApproval(tenantId: string, projectId: string, versionId: string, userId?: string) {
    const v = await this.getVersion(tenantId, versionId);
    if (v.status !== 'draft' && v.status !== 'testing') {
      throw new BadRequestException(`Cannot submit a version in status "${v.status}"`);
    }
    const updated = await prisma.projectVersion.update({
      where: { id: versionId },
      data: { status: 'awaiting_approval' },
    });
    await recordAudit({
      lineage: { tenantId, projectId, projectVersionId: versionId },
      actorId: userId,
      action: 'version.submitted',
      subjectType: 'ProjectVersion',
      subjectId: versionId,
      after: { status: 'awaiting_approval' },
    });
    return updated;
  }

  async approve(
    tenantId: string,
    projectId: string,
    versionId: string,
    decision: 'approved' | 'changes_requested',
    notes: string | undefined,
    userId?: string,
  ) {
    const v = await this.getVersion(tenantId, versionId);
    if (v.status !== 'awaiting_approval') {
      throw new BadRequestException(`Version must be awaiting approval (is "${v.status}")`);
    }

    if (decision === 'changes_requested') {
      const updated = await prisma.projectVersion.update({ where: { id: versionId }, data: { status: 'draft' } });
      await prisma.approval.create({
        data: { tenantId, projectVersionId: versionId, approvedBy: userId ?? 'unknown', decision, notes },
      });
      return updated;
    }

    // Approve + deploy → immutable.
    const [updated] = await prisma.$transaction([
      prisma.projectVersion.update({
        where: { id: versionId },
        data: { status: 'deployed', deployedAt: new Date() },
      }),
      prisma.approval.create({
        data: { tenantId, projectVersionId: versionId, approvedBy: userId ?? 'unknown', decision, notes },
      }),
      prisma.project.update({ where: { id: projectId }, data: { currentVersionId: versionId } }),
    ]);
    await recordAudit({
      lineage: { tenantId, projectId, projectVersionId: versionId },
      actorId: userId,
      action: 'version.deployed',
      subjectType: 'ProjectVersion',
      subjectId: versionId,
      before: { status: 'awaiting_approval' },
      after: { status: 'deployed' },
    });
    return updated;
  }

  // --- Diff -----------------------------------------------------------------

  async diff(tenantId: string, aId: string, bId: string) {
    const [a, b] = await Promise.all([this.getVersion(tenantId, aId), this.getVersion(tenantId, bId)]);
    const key = (m: Json) =>
      `${(m.sources as Array<{ entity: string; field: string }> | undefined)?.map((s) => `${s.entity}.${s.field}`).join('+') ?? ''}→${(m.targets as Array<{ entity: string; field: string }> | undefined)?.map((t) => `${t.entity}.${t.field}`).join('+') ?? ''}`;
    const aMap = new Map((a.mappings as Json[]).map((m) => [key(m), m]));
    const bMap = new Map((b.mappings as Json[]).map((m) => [key(m), m]));

    const added = [...bMap.keys()].filter((k) => !aMap.has(k));
    const removed = [...aMap.keys()].filter((k) => !bMap.has(k));
    const changed = [...bMap.keys()].filter(
      (k) => aMap.has(k) && JSON.stringify(aMap.get(k)) !== JSON.stringify(bMap.get(k)),
    );
    return {
      from: { id: a.id, versionNumber: a.versionNumber },
      to: { id: b.id, versionNumber: b.versionNumber },
      mappings: { added, removed, changed },
      validationCount: {
        from: (a.validations as unknown[]).length,
        to: (b.validations as unknown[]).length,
      },
    };
  }

  // --- Document -------------------------------------------------------------

  async generateDocument(tenantId: string, projectId: string, versionId: string, userId?: string) {
    const [project, tenant, version] = await Promise.all([
      this.assertProject(tenantId, projectId),
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.getVersion(tenantId, versionId),
    ]);
    const productName = ((tenant?.whiteLabel as Json)?.productName as string) ?? 'ETL Platform';

    const markdown = generateMappingDocument({
      productName,
      projectName: project.name,
      projectType: project.type,
      versionNumber: version.versionNumber,
      status: version.status,
      mappings: (version.mappings as unknown as never[]) ?? [],
      validations: (version.validations as unknown as never[]) ?? [],
      testEvidence: version.testEvidence as Json,
      generatedAt: new Date().toISOString(),
    });

    let storageKey: string | null = null;
    try {
      const store = new ObjectStore(loadStorageConfig());
      storageKey = ObjectStore.key({ tenantId, kind: 'report', projectId, filename: `mapping-doc-v${version.versionNumber}.md` });
      await store.putObject(storageKey, markdown);
    } catch {
      storageKey = null; // object storage optional for the doc preview
    }

    const doc = await prisma.generatedDocument.create({
      data: {
        tenantId,
        projectVersionId: versionId,
        kind: 'mapping_doc',
        format: 'markdown',
        storageKey: storageKey ?? 'inline',
      },
    });
    void userId;
    return { id: doc.id, storageKey, markdown };
  }
}
