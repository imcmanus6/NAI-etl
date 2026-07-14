import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { ConnectorType } from '@etl/shared-types';
import type { CanonicalSchema } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { createConnectorRegistry } from '@etl/connectors';
import { createSecretsProvider } from '@etl/secrets';
import { applyMappingSet, type MappingSet } from '@etl/mapping-engine';
import { validateRecord, type ValidationFailure, type ValidationSet } from '@etl/validation-engine';
import { recordAudit } from '@etl/audit';
import { explainFailures } from './explain.js';

const registry = createConnectorRegistry();
const secrets = createSecretsProvider(process.env.SECRETS_PROVIDER ?? 'env', process.env.AWS_REGION);

interface RunInput {
  sampleRecords?: Record<string, unknown>[];
  sourceConnectionId?: string;
  sourceEntity?: string;
  limit?: number;
  versionId?: string;
  mode?: 'test' | 'trial' | 'delta' | 'final' | 'production';
  /** If set, accepted target-ready records are delivered to this destination. */
  deliverToConnectionId?: string;
  /** If set, the CSV output uses this schema's full ordered column list. */
  targetSchemaId?: string;
}

/** Strip the leading "entity." segment so keys become the destination's raw field names. */
function flattenTargetKeys(target: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(target)) {
    const dot = k.indexOf('.');
    out[dot >= 0 ? k.slice(dot + 1) : k] = v;
  }
  return out;
}

/**
 * Render mapped target records as a CSV. If `columns` is given (the target
 * schema's ordered field list), every column is emitted in that exact order
 * with empty strings for unmapped fields — so the output matches the target
 * import layout (e.g. a 147-column Universal Import file). Otherwise columns are
 * inferred in first-seen order.
 */
function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  const cols =
    columns && columns.length
      ? columns
      : (() => {
          const c: string[] = [];
          for (const r of rows) for (const k of Object.keys(r)) if (!c.includes(k)) c.push(k);
          return c;
        })();
  if (cols.length === 0) return '';
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c] ?? '')).join(','))].join('\n');
}

/**
 * Deterministic test-run executor (Phase 5–6).
 *
 * Runs the mapping → transformation → validation → reconciliation pipeline over
 * a bounded sample. No LLM in the record path. Persists a Run with metrics,
 * rejected records and reconciliation, and returns a preview + AI-style error
 * explanation for the UI. The full/streamed pipeline runs in the Temporal
 * worker; this bounded version powers the interactive test screen.
 */
@Injectable()
export class TestRunsService {
  private async resolveVersion(tenantId: string, projectId: string, versionId?: string) {
    if (versionId) {
      const v = await prisma.projectVersion.findFirst({ where: { id: versionId, tenantId, projectId } });
      if (!v) throw new NotFoundException('Version not found');
      return v;
    }
    const draft = await prisma.projectVersion.findFirst({
      where: { tenantId, projectId, status: 'draft' },
      orderBy: { versionNumber: 'desc' },
    });
    if (!draft) throw new BadRequestException('No draft version — accept some mappings first');
    return draft;
  }

  private async getRecords(tenantId: string, input: RunInput): Promise<Record<string, unknown>[]> {
    if (input.sampleRecords?.length) return input.sampleRecords.slice(0, input.limit ?? 1000);
    if (input.sourceConnectionId && input.sourceEntity) {
      const conn = await prisma.connection.findFirst({ where: { id: input.sourceConnectionId, tenantId } });
      if (!conn) throw new NotFoundException('Source connection not found');
      const connector = registry.get(conn.connectorType as ConnectorType);
      if (!connector.read) throw new BadRequestException(`${conn.connectorType} cannot read data`);
      const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
      const rt = {
        connectionId: conn.id,
        connectorType: conn.connectorType as ConnectorType,
        config: conn.config as Record<string, unknown>,
        secrets: resolved,
      };
      const records: Record<string, unknown>[] = [];
      for await (const batch of connector.read(rt, { entity: input.sourceEntity, limit: input.limit ?? 200, batchSize: 200 })) {
        records.push(...batch.records);
        if (records.length >= (input.limit ?? 200)) break;
      }
      return records;
    }
    throw new BadRequestException('Provide sampleRecords or a sourceConnectionId + sourceEntity');
  }

  async run(tenantId: string, projectId: string, input: RunInput, userId?: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new NotFoundException('Project not found');
    const version = await this.resolveVersion(tenantId, projectId, input.versionId);
    const records = await this.getRecords(tenantId, input);

    // Full ordered output columns (so the CSV matches the target import layout).
    let outputColumns: string[] | undefined;
    if (input.targetSchemaId) {
      const schemaRow = await prisma.schemaModel.findFirst({ where: { id: input.targetSchemaId, tenantId } });
      if (schemaRow) {
        const schema = schemaRow.model as unknown as CanonicalSchema;
        outputColumns = schema.entities.flatMap((e) => e.fields.map((f) => f.name));
      }
    }

    const mappingSet = {
      projectVersionId: version.id,
      mappings: (version.mappings as unknown as MappingSet['mappings']) ?? [],
    } as MappingSet;
    const validationSet: ValidationSet = {
      projectVersionId: version.id,
      rules: (version.validations as unknown as ValidationSet['rules']) ?? [],
    };

    // Resolve environment for the lineage tuple.
    const env =
      (project.defaultEnvId && (await prisma.environment.findUnique({ where: { id: project.defaultEnvId } }))) ||
      (await prisma.environment.findFirst({ where: { tenantId, name: 'development' } })) ||
      (await prisma.environment.findFirst({ where: { tenantId } }));
    if (!env) throw new BadRequestException('No environment configured for this tenant');

    const runRow = await prisma.run.create({
      data: {
        tenantId,
        customerId: project.customerId,
        environmentId: env.id,
        projectId,
        projectVersionId: version.id,
        mode: input.mode ?? 'test',
        status: 'running',
        currentStage: 'transformation',
        startedAt: new Date(),
      },
    });

    // Execute the deterministic pipeline.
    const preview: Array<{ source: Record<string, unknown>; target: Record<string, unknown>; passed: boolean }> = [];
    const allFailures: ValidationFailure[] = [];
    const rejects: Array<{ recordKey: string; reason: string; failingRule: string }> = [];
    const targetHashes = new Map<string, number>();
    const acceptedTargets: Record<string, unknown>[] = [];
    let accepted = 0;
    let rejected = 0;

    records.forEach((source, i) => {
      const { target } = applyMappingSet(mappingSet, source, {});
      const result = validateRecord(validationSet, target, String(i));
      if (i < 20) preview.push({ source, target, passed: result.passed });

      const hash = JSON.stringify(target);
      targetHashes.set(hash, (targetHashes.get(hash) ?? 0) + 1);

      if (result.passed) {
        accepted += 1;
        // Collect target-ready records (flattened to destination field names) for
        // CSV output and/or delivery. Bounded by the sample size.
        if (acceptedTargets.length < 10000) acceptedTargets.push(flattenTargetKeys(target));
      } else {
        rejected += 1;
        allFailures.push(...result.failures);
        const rejectFailures = result.failures.filter((f) => f.severity === 'reject');
        rejects.push({
          recordKey: String(i),
          reason: rejectFailures.map((f) => f.message).join('; '),
          failingRule: rejectFailures.map((f) => f.ruleType).join(','),
        });
      }
    });

    const duplicateTargets = [...targetHashes.values()].filter((c) => c > 1).reduce((a, c) => a + (c - 1), 0);
    const explanation = explainFailures(allFailures);

    const metrics = {
      sourceRecords: records.length,
      acceptedRecords: accepted,
      rejectedRecords: rejected,
      duplicateRecords: duplicateTargets,
      warnings: allFailures.filter((f) => f.severity === 'warn').length,
      errors: 0,
    };

    // Persist results.
    await prisma.$transaction([
      prisma.run.update({
        where: { id: runRow.id },
        data: { status: 'succeeded', currentStage: 'reconciliation', finishedAt: new Date(), metrics: metrics as object },
      }),
      prisma.runStage.create({
        data: { runId: runRow.id, name: 'validation', status: 'succeeded', detail: { accepted, rejected } as object },
      }),
      prisma.reconciliation.create({
        data: {
          runId: runRow.id,
          kind: 'counts',
          passed: rejected === 0,
          result: {
            sourceCount: records.length,
            targetReadyCount: accepted,
            rejected,
            duplicateTargets,
          } as object,
        },
      }),
      ...rejects
        .slice(0, 200)
        .map((r) =>
          prisma.rejectedRecord.create({
            data: { runId: runRow.id, recordKey: r.recordKey, reason: r.reason, failingRule: r.failingRule },
          }),
        ),
    ]);

    // Store test evidence on the (draft) version for the generated document.
    if (version.status === 'draft') {
      await prisma.projectVersion.update({
        where: { id: version.id },
        data: { status: 'testing', testEvidence: { lastRun: runRow.id, metrics } as object },
      });
    }

    // Deliver accepted, target-ready records to the destination (e.g. Lateral).
    let delivery: { connectionId: string; created: number; failed: number; skipped: number; errors: unknown[] } | null = null;
    if (input.deliverToConnectionId && acceptedTargets.length > 0) {
      const conn = await prisma.connection.findFirst({ where: { id: input.deliverToConnectionId, tenantId } });
      if (conn && registry.has(conn.connectorType as ConnectorType)) {
        const connector = registry.get(conn.connectorType as ConnectorType);
        if (connector.write) {
          const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
          const result = await connector.write(
            { connectionId: conn.id, connectorType: conn.connectorType as ConnectorType, config: conn.config as Record<string, unknown>, secrets: resolved },
            acceptedTargets,
            { entity: '', mode: 'insert' },
          );
          delivery = { connectionId: conn.id, created: result.created, failed: result.failed, skipped: result.skipped, errors: result.errors };
          await prisma.runStage.create({
            data: { runId: runRow.id, name: 'delivery', status: result.failed === 0 ? 'succeeded' : 'failed', detail: delivery as object },
          });
          await recordAudit({
            lineage: { tenantId, customerId: project.customerId, environmentId: env.id, projectId, projectVersionId: version.id, runId: runRow.id },
            actorId: userId,
            action: 'testrun.delivered',
            subjectType: 'Run',
            subjectId: runRow.id,
            after: delivery,
          });
        }
      }
    }

    await recordAudit({
      lineage: { tenantId, customerId: project.customerId, environmentId: env.id, projectId, projectVersionId: version.id, runId: runRow.id },
      actorId: userId,
      action: 'testrun.completed',
      subjectType: 'Run',
      subjectId: runRow.id,
      after: metrics,
    });

    return {
      runId: runRow.id,
      versionId: version.id,
      metrics,
      reconciliation: { sourceCount: records.length, targetReadyCount: accepted, rejected, duplicateTargets, passed: rejected === 0 },
      preview,
      rejects,
      explanation,
      delivery,
      // Lateral-format CSV of the mapped, target-ready records (for file ingestion).
      csvOutput: toCsv(acceptedTargets, outputColumns),
      outputRecords: acceptedTargets.length,
    };
  }

  listRuns(tenantId: string, projectId: string) {
    return prisma.run.findMany({
      where: { tenantId, projectId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, mode: true, status: true, metrics: true, projectVersionId: true, createdAt: true, finishedAt: true },
    });
  }

  async getRun(tenantId: string, runId: string) {
    const run = await prisma.run.findFirst({ where: { id: runId, tenantId } });
    if (!run) throw new NotFoundException('Run not found');
    const [stages, reconciliations, rejects] = await Promise.all([
      prisma.runStage.findMany({ where: { runId } }),
      prisma.reconciliation.findMany({ where: { runId } }),
      prisma.rejectedRecord.findMany({ where: { runId }, take: 200 }),
    ]);
    return { ...run, stages, reconciliations, rejects };
  }
}
