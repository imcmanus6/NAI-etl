/**
 * MySQL connector: connection test + schema discovery via information_schema.
 */
import { createConnection, type Connection } from 'mysql2/promise';
import type {
  Connector,
  ConnectionRuntime,
  ConnectorCapabilities,
  DiscoverOptions,
  ReadOptions,
  RecordBatch,
  SourceRecord,
  TestConnectionResult,
} from '@etl/connector-sdk';
import type { CanonicalSchema, CanonicalType, Entity, Field, Relationship } from '@etl/schema-model';

const CAPS: ConnectorCapabilities = {
  canTestConnection: true,
  canDiscoverSchema: true,
  canReadData: true,
  canWriteData: true,
  supportsPagination: true,
  supportsIncrementalExtraction: true,
  supportsChangeTracking: false,
  supportsStreaming: true,
  supportsBatchWrites: true,
  supportsTransactions: true,
  supportsSchemaInference: true,
};

function mapMysqlType(t: string): CanonicalType {
  const s = t.toLowerCase();
  if (/int/.test(s)) return 'integer';
  if (/decimal|numeric/.test(s)) return 'decimal';
  if (/float|double/.test(s)) return 'float';
  if (/bool|tinyint\(1\)/.test(s)) return 'boolean';
  if (/datetime|timestamp/.test(s)) return 'datetime';
  if (/date/.test(s)) return 'date';
  if (/time/.test(s)) return 'time';
  if (/json/.test(s)) return 'json';
  if (/blob|binary/.test(s)) return 'binary';
  if (/text/.test(s)) return 'text';
  return 'string';
}

async function connect(conn: ConnectionRuntime): Promise<Connection> {
  return createConnection({
    host: conn.config.host as string,
    port: Number(conn.config.port ?? 3306),
    database: conn.config.database as string,
    user: conn.secrets.user,
    password: conn.secrets.password,
  });
}

export class MysqlConnector implements Connector {
  readonly type = 'mysql' as const;
  readonly capabilities = CAPS;

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    try {
      const c = await connect(conn);
      const [rows] = await c.query('select version() as v');
      await c.end();
      return { ok: true, message: 'Connected', details: { version: (rows as any)[0]?.v } };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async discoverSchema(conn: ConnectionRuntime, opts?: DiscoverOptions): Promise<CanonicalSchema> {
    const c = await connect(conn);
    const db = conn.config.database as string;
    try {
      const [cols] = await c.query(
        `select table_name, column_name, ordinal_position, data_type, column_type,
                is_nullable, column_default, column_key, character_maximum_length,
                numeric_precision, numeric_scale, table_rows
         from information_schema.columns
         where table_schema = ?
         order by table_name, ordinal_position`,
        [db],
      );
      const [fks] = await c.query(
        `select constraint_name, table_name, column_name, referenced_table_name, referenced_column_name
         from information_schema.key_column_usage
         where table_schema = ? and referenced_table_name is not null`,
        [db],
      );

      const entities = new Map<string, Entity>();
      for (const row of cols as any[]) {
        let entity = entities.get(row.table_name);
        if (!entity) {
          entity = { id: row.table_name, name: row.table_name, namespace: db, kind: 'table', classification: 'unknown', fields: [], primaryKey: [] };
          entities.set(row.table_name, entity);
        }
        const field: Field = {
          id: `${row.table_name}.${row.column_name}`,
          name: row.column_name,
          ordinal: row.ordinal_position,
          dataType: mapMysqlType(row.column_type ?? row.data_type),
          nativeType: row.column_type,
          nullable: row.is_nullable === 'YES',
          isPrimaryKey: row.column_key === 'PRI',
          isForeignKey: row.column_key === 'MUL',
          defaultValue: row.column_default,
          length: row.character_maximum_length ?? undefined,
          precision: row.numeric_precision ?? undefined,
          scale: row.numeric_scale ?? undefined,
        };
        entity.fields.push(field);
        if (field.isPrimaryKey) entity.primaryKey!.push(field.name);
      }

      const relationships: Relationship[] = (fks as any[]).map((r) => ({
        id: r.constraint_name,
        fromEntityId: r.table_name,
        fromFields: [r.column_name],
        toEntityId: r.referenced_table_name,
        toFields: [r.referenced_column_name],
        cardinality: 'one_to_many',
        declared: true,
        certainty: 'confirmed',
        evidence: [{ kind: 'foreign_key', detail: `${r.table_name}.${r.column_name} -> ${r.referenced_table_name}.${r.referenced_column_name}` }],
      }));

      void opts;
      return {
        id: `${conn.connectionId}-schema`,
        name: db,
        intakeMethod: 'db_introspection',
        entities: [...entities.values()],
        relationships,
        provenance: { connectorType: 'mysql' },
        createdAt: new Date().toISOString(),
      };
    } finally {
      await c.end();
    }
  }

  async *read(conn: ConnectionRuntime, opts: ReadOptions): AsyncIterable<RecordBatch> {
    const c = await connect(conn);
    try {
      const cols = opts.columns?.length ? opts.columns.map((x) => `\`${x}\``).join(',') : '*';
      const limit = opts.limit ? `limit ${opts.limit}` : '';
      const [rows] = await c.query(`select ${cols} from \`${opts.entity}\` ${limit}`);
      yield { records: rows as SourceRecord[], nextCursor: null, done: true };
    } finally {
      await c.end();
    }
  }
}
