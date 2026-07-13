/**
 * CSV / delimited-text connector.
 *
 * Reads stream in batches (never loads the whole file into memory). The file is
 * read from object storage by the worker and passed by local path/stream; here
 * we accept a `filePath` in config for simplicity. Schema is inferred from the
 * header + a sampled set of rows.
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type {
  Connector,
  ConnectionRuntime,
  ConnectorCapabilities,
  ReadOptions,
  RecordBatch,
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

const DELIMITER_ALIASES: Record<string, string> = { tab: '\t', pipe: '|', comma: ',', semicolon: ';' };

/** Explicit delimiter from config wins; otherwise auto-detect from the header. */
function resolveDelimiter(conn: ConnectionRuntime, headerLine: string): string {
  const configured = conn.config.delimiter as string | undefined;
  if (configured) return DELIMITER_ALIASES[configured.toLowerCase()] ?? configured;
  return detectDelimiter(headerLine);
}

function detectDelimiter(headerLine: string): string {
  const candidates = [',', '\t', ';', '|'];
  let best = ',';
  let bestCount = -1;
  for (const d of candidates) {
    const count = headerLine.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

function inferType(values: string[]): CanonicalType {
  const nonEmpty = values.filter((v) => v !== '' && v != null);
  if (nonEmpty.length === 0) return 'string';
  const allInt = nonEmpty.every((v) => /^-?\d+$/.test(v));
  if (allInt) return 'integer';
  const allNum = nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v));
  if (allNum) return 'decimal';
  const allBool = nonEmpty.every((v) => /^(true|false|yes|no|y|n|0|1)$/i.test(v));
  if (allBool) return 'boolean';
  const allDate = nonEmpty.every((v) => !Number.isNaN(new Date(v).getTime()) && /\d{4}|\d{2}[/-]/.test(v));
  if (allDate) return 'datetime';
  return 'string';
}

export class CsvConnector implements Connector {
  readonly type = 'csv' as const;
  readonly capabilities = CAPS;

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    const filePath = conn.config.filePath as string | undefined;
    if (!filePath) return { ok: false, message: 'No filePath configured' };
    try {
      await new Promise<void>((resolve, reject) => {
        const s = createReadStream(filePath, { start: 0, end: 0 });
        s.on('open', () => {
          s.close();
          resolve();
        });
        s.on('error', reject);
      });
      return { ok: true, message: 'File is readable' };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  /** Infer a single-entity schema from the header + a sample of rows. */
  async inferSchema(conn: ConnectionRuntime, entity: string): Promise<Entity> {
    const filePath = conn.config.filePath as string;
    const sampleSize = Number(conn.config.sampleRows ?? 200);
    const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });

    let header: string[] = [];
    let delimiter = ',';
    const columns: string[][] = [];
    let read = 0;

    for await (const line of rl) {
      if (read === 0) {
        delimiter = resolveDelimiter(conn, line);
        header = line.split(delimiter).map((h) => h.trim());
        header.forEach(() => columns.push([]));
      } else {
        const cells = line.split(delimiter);
        header.forEach((_, i) => columns[i]!.push((cells[i] ?? '').trim()));
        if (read >= sampleSize) break;
      }
      read += 1;
    }
    rl.close();

    const fields: Field[] = header.map((name, i) => {
      const vals = columns[i] ?? [];
      const nullRate = vals.length ? vals.filter((v) => v === '').length / vals.length : 1;
      return {
        id: `${entity}.${name}`,
        name,
        ordinal: i,
        dataType: inferType(vals),
        nullable: nullRate > 0,
        isPrimaryKey: false,
        isForeignKey: false,
        profile: { nullRate, sampleValues: vals.slice(0, 5) },
      };
    });

    return {
      id: entity,
      name: entity,
      kind: 'file',
      classification: 'unknown',
      fields,
    };
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const filePath = conn.config.filePath as string;
    const batchSize = opts.batchSize ?? 1000;
    const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });

    let header: string[] = [];
    let delimiter = ',';
    let batch: Record<string, unknown>[] = [];
    let lineNo = 0;
    let emitted = 0;

    for await (const line of rl) {
      if (lineNo === 0) {
        delimiter = resolveDelimiter(conn, line);
        header = line.split(delimiter).map((h) => h.trim());
      } else {
        const cells = line.split(delimiter);
        const record: Record<string, unknown> = {};
        header.forEach((h, i) => (record[h] = cells[i] ?? null));
        batch.push(record);
        emitted += 1;
        if (opts.limit && emitted >= opts.limit) break;
        if (batch.length >= batchSize) {
          yield { records: batch, nextCursor: null, done: false };
          batch = [];
        }
      }
      lineNo += 1;
    }
    rl.close();
    yield { records: batch, nextCursor: null, done: true };
  }
}
