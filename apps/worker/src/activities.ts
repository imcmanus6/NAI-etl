/**
 * Temporal activities — where all I/O and deterministic processing happens.
 *
 * These run in the normal Node runtime (unlike workflows), so they may use
 * connectors, DuckDB, the DB, object storage, and the AI service. Each activity
 * is idempotent and receives the lineage tuple.
 *
 * This file implements a representative subset for the MVP walking skeleton;
 * remaining activities from EtlActivities are stubbed with clear TODOs.
 */
import { createConnectorRegistry } from '@etl/connectors';
import type { ConnectorType, LineageContext } from '@etl/shared-types';
import { prisma } from '@etl/database';
import { createSecretsProvider } from '@etl/secrets';
import { applyMappingSet } from '@etl/mapping-engine';
import { validateRecord, type ValidationSet } from '@etl/validation-engine';
import type { MappingSet } from '@etl/mapping-engine';
import { createLogger } from '@etl/observability';

const registry = createConnectorRegistry();
const secrets = createSecretsProvider(process.env.SECRETS_PROVIDER ?? 'env', process.env.AWS_REGION);
const log = createLogger({ component: 'worker-activities' });

async function runtimeFor(connectionId: string) {
  const conn = await prisma.connection.findUniqueOrThrow({ where: { id: connectionId } });
  const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
  return {
    connectionId: conn.id,
    connectorType: conn.connectorType as ConnectorType,
    config: conn.config as Record<string, unknown>,
    secrets: resolved,
    _row: conn,
  };
}

export async function testConnection(input: { lineage: LineageContext; connectionId: string }) {
  const rt = await runtimeFor(input.connectionId);
  const connector = registry.get(rt.connectorType);
  return connector.testConnection(rt);
}

export async function discoverSchema(input: { lineage: LineageContext; connectionId: string }) {
  const rt = await runtimeFor(input.connectionId);
  const connector = registry.get(rt.connectorType);
  if (!connector.discoverSchema) throw new Error(`${rt.connectorType} cannot discover schema`);
  const schema = await connector.discoverSchema(rt, { estimateRowCounts: true, detectRelationships: true });
  const saved = await prisma.schemaModel.create({
    data: {
      tenantId: input.lineage.tenantId,
      connectionId: input.connectionId,
      name: schema.name,
      intakeMethod: 'db_introspection',
      model: schema as unknown as object,
      provenance: (schema.provenance ?? {}) as object,
    },
  });
  log.info({ schemaModelId: saved.id, entities: schema.entities.length }, 'schema discovered');
  return { schemaModelId: saved.id, entities: schema.entities.length };
}

/**
 * Deterministic transform+validate over a batch of extracted records. In the
 * full pipeline the batch is streamed from object storage; here it is passed
 * inline for the walking skeleton.
 */
export async function transformAndValidate(input: {
  lineage: LineageContext;
  records: Record<string, unknown>[];
  mappingSet: MappingSet;
  validationSet: ValidationSet;
}) {
  let accepted = 0;
  let rejected = 0;
  const rejects: Array<{ recordKey: string; reason: string }> = [];

  input.records.forEach((source, i) => {
    const { target } = applyMappingSet(input.mappingSet, source, {});
    const result = validateRecord(input.validationSet, target, String(i));
    if (result.passed) {
      accepted += 1;
    } else {
      rejected += 1;
      rejects.push({ recordKey: String(i), reason: result.failures.map((f) => f.message).join('; ') });
    }
  });

  return { accepted, rejected, rejects };
}

/** Source-to-target count reconciliation (financial/referential added later). */
export async function reconcileCounts(input: {
  lineage: LineageContext;
  sourceCount: number;
  targetCount: number;
}) {
  const passed = input.sourceCount === input.targetCount;
  return {
    passed,
    report: { sourceCount: input.sourceCount, targetCount: input.targetCount, delta: input.sourceCount - input.targetCount },
  };
}

export async function notify(input: { lineage: LineageContext; event: string; detail?: Record<string, unknown> }) {
  log.info({ event: input.event, detail: input.detail, runId: input.lineage.runId }, 'notification');
}
