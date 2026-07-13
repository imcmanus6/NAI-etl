/**
 * Fixed-width connector.
 *
 * Driven entirely by a declared `layout` (a FixedWidthField[] — often inferred
 * from documentation via @etl/schema-discovery), so no bespoke plugin is needed
 * per feed. Reads stream line-by-line and slice by position.
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
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
import type { FixedWidthField } from '@etl/shared-types';

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

const canonical = (t: FixedWidthField['type']): CanonicalType =>
  t === 'number' ? 'decimal' : t === 'date' ? 'date' : t === 'boolean' ? 'boolean' : 'string';

function layoutOf(conn: ConnectionRuntime): FixedWidthField[] {
  const layout = conn.config.layout as FixedWidthField[] | undefined;
  if (!layout?.length) throw new Error('Fixed-width connection has no layout configured');
  return layout;
}

export class FixedWidthConnector implements Connector {
  readonly type = 'fixedwidth' as const;
  readonly capabilities = CAPS;

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    const filePath = conn.config.filePath as string | undefined;
    if (!filePath) return { ok: false, message: 'No filePath configured' };
    if (!(conn.config.layout as FixedWidthField[])?.length) return { ok: false, message: 'No layout configured' };
    try {
      await new Promise<void>((resolve, reject) => {
        const s = createReadStream(filePath, { start: 0, end: 0 });
        s.on('open', () => (s.close(), resolve()));
        s.on('error', reject);
      });
      return { ok: true, message: 'File readable; layout present' };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async inferSchema(conn: ConnectionRuntime, entity: string): Promise<Entity> {
    const layout = layoutOf(conn);
    const fields: Field[] = layout.map((f, i) => ({
      id: `${entity}.${f.name}`,
      name: f.name,
      ordinal: i,
      dataType: canonical(f.type),
      nativeType: `fixed(${f.start},${f.width})`,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      description: f.description,
      annotations: { detectedFormat: `fixed-width @${f.start}+${f.width}` },
    }));
    return { id: entity, name: entity, kind: 'file', classification: 'unknown', fields };
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const filePath = conn.config.filePath as string;
    const layout = layoutOf(conn);
    const batchSize = opts.batchSize ?? 1000;
    const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
    let batch: SourceRecord[] = [];
    let emitted = 0;
    for await (const line of rl) {
      if (!line.trim()) continue;
      const record: SourceRecord = {};
      for (const f of layout) record[f.name] = line.slice(f.start - 1, f.start - 1 + f.width).trim();
      batch.push(record);
      emitted += 1;
      if (opts.limit && emitted >= opts.limit) break;
      if (batch.length >= batchSize) {
        yield { records: batch, nextCursor: null, done: false };
        batch = [];
      }
    }
    rl.close();
    yield { records: batch, nextCursor: null, done: true };
  }
}
