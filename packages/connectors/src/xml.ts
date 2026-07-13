/**
 * XML connector.
 *
 * Flattens a repeating record element into flat records. `config.recordPath`
 * names the repeating element (e.g. "Customer"); if omitted we auto-detect the
 * most frequent repeating child. Nested scalars are flattened with dotted keys.
 */
import { readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
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
  supportsStreaming: false,
  supportsBatchWrites: false,
  supportsTransactions: false,
  supportsSchemaInference: true,
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: true });

function flatten(obj: unknown, prefix = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  if (obj == null || typeof obj !== 'object') {
    if (prefix) out[prefix] = obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else if (Array.isArray(v)) out[key] = v; // leave arrays as-is
    else out[key] = v;
  }
  return out;
}

/** Find the array of repeating record objects, honoring an explicit recordPath. */
function findRecords(doc: Record<string, unknown>, recordPath?: string): Record<string, unknown>[] {
  const walk = (node: unknown): Record<string, unknown>[] | null => {
    if (node == null || typeof node !== 'object') return null;
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (recordPath && k === recordPath) return Array.isArray(v) ? (v as Record<string, unknown>[]) : [v as Record<string, unknown>];
      if (!recordPath && Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return v as Record<string, unknown>[];
      const nested = walk(v);
      if (nested) return nested;
    }
    return null;
  };
  return walk(doc) ?? [];
}

export class XmlConnector implements Connector {
  readonly type = 'xml' as const;
  readonly capabilities = CAPS;

  private async load(conn: ConnectionRuntime): Promise<Record<string, unknown>[]> {
    const raw = await readFile(conn.config.filePath as string, 'utf8');
    const doc = parser.parse(raw);
    const records = findRecords(doc, conn.config.recordPath as string | undefined);
    return records.map((r) => flatten(r));
  }

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    try {
      const records = await this.load(conn);
      return { ok: true, message: `Parsed ${records.length} record(s)` };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async inferSchema(conn: ConnectionRuntime, entity: string): Promise<Entity> {
    const records = (await this.load(conn)).slice(0, Number(conn.config.sampleRows ?? 200));
    const keys = new Set<string>();
    for (const r of records) Object.keys(r).forEach((k) => keys.add(k));
    const fields: Field[] = [...keys].map((name, i) => {
      const values = records.map((r) => r[name]).filter((v) => v != null);
      const dataType: CanonicalType = values.every((v) => typeof v === 'number')
        ? 'decimal'
        : values.every((v) => typeof v === 'boolean')
          ? 'boolean'
          : 'string';
      return {
        id: `${entity}.${name}`,
        name,
        ordinal: i,
        dataType,
        nativeType: name.startsWith('@_') ? 'xml-attribute' : 'xml-element',
        nullable: values.length < records.length,
        isPrimaryKey: false,
        isForeignKey: false,
        profile: { sampleValues: values.slice(0, 5) },
      };
    });
    return { id: entity, name: entity, kind: 'file', classification: 'unknown', fields };
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const records = await this.load(conn);
    const limited = opts.limit ? records.slice(0, opts.limit) : records;
    const batchSize = opts.batchSize ?? 1000;
    for (let i = 0; i < limited.length; i += batchSize) {
      yield { records: limited.slice(i, i + batchSize) as SourceRecord[], nextCursor: null, done: i + batchSize >= limited.length };
    }
  }
}
