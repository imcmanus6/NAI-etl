/**
 * @etl/connector-sdk — Deliverable 5: the standard connector interface.
 *
 * Every source/destination connector implements {@link Connector}. Connectors
 * declare their {@link ConnectorCapabilities} so the platform can adapt the UI
 * and workflows (e.g. hide "incremental extraction" for a plain CSV).
 *
 * Connectors NEVER hold raw credentials. They receive a resolved
 * {@link ConnectionRuntime} whose secret values are injected at execution time
 * by the worker via the secrets abstraction.
 */
import type { CanonicalSchema, Entity } from '@etl/schema-model';
import type { ConnectorType } from '@etl/shared-types';

// --- Capability model -------------------------------------------------------

export interface ConnectorCapabilities {
  canTestConnection: boolean;
  canDiscoverSchema: boolean;
  canReadData: boolean;
  canWriteData: boolean;
  supportsPagination: boolean;
  supportsIncrementalExtraction: boolean;
  supportsChangeTracking: boolean;
  supportsStreaming: boolean;
  supportsBatchWrites: boolean;
  supportsTransactions: boolean;
  supportsSchemaInference: boolean;
}

export const NO_CAPABILITIES: ConnectorCapabilities = {
  canTestConnection: false,
  canDiscoverSchema: false,
  canReadData: false,
  canWriteData: false,
  supportsPagination: false,
  supportsIncrementalExtraction: false,
  supportsChangeTracking: false,
  supportsStreaming: false,
  supportsBatchWrites: false,
  supportsTransactions: false,
  supportsSchemaInference: false,
};

// --- Runtime connection (post secret-resolution) ----------------------------

/**
 * A connection instance ready to use. `config` holds non-secret settings
 * (host, port, database, path, options). `secrets` holds values resolved from
 * the secrets manager for THIS execution only — never persisted here.
 */
export interface ConnectionRuntime {
  connectionId: string;
  connectorType: ConnectorType;
  config: Record<string, unknown>;
  secrets: Record<string, string>;
}

// --- Read / write shapes ----------------------------------------------------

/** A single record as a flat property bag. Values stay in native JS types. */
export type SourceRecord = Record<string, unknown>;

export interface ReadOptions {
  /** Which entity (table/view/endpoint/file) to read. */
  entity: string;
  /** Optional column projection. */
  columns?: string[];
  /** Deterministic filter expression (connector-native or canonical). */
  filter?: string;
  /** Cap rows (used by test/sample runs). */
  limit?: number;
  /** For incremental extraction: only records changed since this cursor. */
  since?: IncrementalCursor;
  /** Preferred batch size for streaming. */
  batchSize?: number;
}

export interface IncrementalCursor {
  /** Column or token the connector advances on (e.g. updated_at, LSN, page). */
  field: string;
  value: string | number;
}

export interface WriteOptions {
  entity: string;
  /** upsert requires keyFields; insert appends; update requires keyFields. */
  mode: 'insert' | 'upsert' | 'update';
  keyFields?: string[];
  batchSize?: number;
  /** Wrap the batch in a transaction where the connector supports it. */
  transactional?: boolean;
}

export interface WriteResult {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  /** Per-record errors, if any, keyed by the record's business key. */
  errors: Array<{ key: string; message: string }>;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  /** e.g. server version, latency, detected dialect. */
  details?: Record<string, unknown>;
}

// --- Discovery / read result batches ---------------------------------------

export interface DiscoverOptions {
  /** Restrict discovery to specific databases/schemas where applicable. */
  namespaces?: string[];
  estimateRowCounts?: boolean;
  detectRelationships?: boolean;
}

/**
 * A batch of records plus the cursor to resume from. Connectors yield these
 * lazily so callers never hold an entire dataset in memory.
 */
export interface RecordBatch {
  records: SourceRecord[];
  nextCursor: IncrementalCursor | null;
  done: boolean;
}

// --- The connector interface ------------------------------------------------

export interface Connector {
  readonly type: ConnectorType;
  readonly capabilities: ConnectorCapabilities;

  /** Verify reachability & auth. */
  testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult>;

  /** Introspect into the canonical schema model. */
  discoverSchema?(conn: ConnectionRuntime, opts?: DiscoverOptions): Promise<CanonicalSchema>;

  /** Infer a schema for a single entity from sample data. */
  inferSchema?(conn: ConnectionRuntime, entity: string): Promise<Entity>;

  /** Stream records in batches. Implemented as an async generator. */
  read?(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch>;

  /** Write a batch of records to a destination entity. */
  write?(conn: ConnectionRuntime, records: SourceRecord[], opts: WriteOptions): Promise<WriteResult>;
}

/** Factory registered per connector type. */
export interface ConnectorFactory {
  type: ConnectorType;
  create(): Connector;
}

/** Simple in-process registry; the worker wires concrete connectors in. */
export class ConnectorRegistry {
  private readonly factories = new Map<ConnectorType, ConnectorFactory>();

  register(factory: ConnectorFactory): void {
    this.factories.set(factory.type, factory);
  }

  get(type: ConnectorType): Connector {
    const factory = this.factories.get(type);
    if (!factory) throw new Error(`No connector registered for type "${type}"`);
    return factory.create();
  }

  has(type: ConnectorType): boolean {
    return this.factories.has(type);
  }

  listTypes(): ConnectorType[] {
    return [...this.factories.keys()];
  }
}
