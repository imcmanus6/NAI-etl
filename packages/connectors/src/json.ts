/**
 * JSON connector. Handles a JSON array of objects (or NDJSON). Infers a schema
 * from a sample and streams records in batches.
 */
import { readFile } from 'node:fs/promises';
import type {
  Connector,
  ConnectionRuntime,
  ConnectorCapabilities,
  ReadOptions,
  RecordBatch,
  SourceRecord,
  TestConnectionResult,
} from '@etl/connector-sdk';
import type { CanonicalType, Entity, Field } from '@etl/schema-model';

const CAPS: ConnectorCapabilities = {
  canTestConnection: true,
  canDiscoverSchema: false,
  canReadData: true,
  canWriteData: false,
  supportsPagination: false,
  supportsIncrementalExtraction: false,
  supportsChangeTracking: false,
  supportsStreaming: true,
  supportsBatchWrites: false,
  supportsTransactions: false,
  supportsSchemaInference: true,
};

function jsType(v: unknown): CanonicalType {
  if (v == null) return 'unknown';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'decimal';
  if (typeof v === 'boolean') return 'boolean';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'object') return 'json';
  if (typeof v === 'string') {
    if (!Number.isNaN(new Date(v).getTime()) && /\d{4}-\d{2}-\d{2}/.test(v)) return 'datetime';
    return 'string';
  }
  return 'string';
}

async function loadRows(filePath: string): Promise<Record<string, unknown>[]> {
  const raw = await readFile(filePath, 'utf8');
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) return JSON.parse(trimmed);
  // NDJSON
  return trimmed
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export class JsonConnector implements Connector {
  readonly type = 'json' as const;
  readonly capabilities = CAPS;

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    try {
      await readFile(conn.config.filePath as string, 'utf8');
      return { ok: true, message: 'File is readable' };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async inferSchema(conn: ConnectionRuntime, entity: string): Promise<Entity> {
    const rows = await loadRows(conn.config.filePath as string);
    const sample = rows.slice(0, Number(conn.config.sampleRows ?? 200));
    const keys = new Set<string>();
    for (const r of sample) Object.keys(r).forEach((k) => keys.add(k));
    const fields: Field[] = [...keys].map((name, i) => {
      const values = sample.map((r) => r[name]);
      const nonNull = values.filter((v) => v != null);
      return {
        id: `${entity}.${name}`,
        name,
        ordinal: i,
        dataType: jsType(nonNull[0]),
        nullable: nonNull.length < values.length,
        isPrimaryKey: false,
        isForeignKey: false,
        profile: { nullRate: values.length ? 1 - nonNull.length / values.length : 1, sampleValues: nonNull.slice(0, 5) },
      };
    });
    return { id: entity, name: entity, kind: 'file', classification: 'unknown', fields };
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const rows = await loadRows(conn.config.filePath as string);
    const limited = opts.limit ? rows.slice(0, opts.limit) : rows;
    const batchSize = opts.batchSize ?? 1000;
    for (let i = 0; i < limited.length; i += batchSize) {
      const slice = limited.slice(i, i + batchSize) as SourceRecord[];
      yield { records: slice, nextCursor: null, done: i + batchSize >= limited.length };
    }
  }
}
