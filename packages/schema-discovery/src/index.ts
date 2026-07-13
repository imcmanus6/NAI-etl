/**
 * @etl/schema-discovery — file-based schema intake parsers.
 *
 * Converts uploaded artefacts (SQL DDL, CSV/Excel data dictionaries, JSON
 * schema, OpenAPI) into the canonical schema model. DB introspection lives in
 * the connectors; this package covers the "no live connection" intake methods.
 *
 * The DDL parser here is intentionally lightweight (handles the common
 * `CREATE TABLE` shape); swap in a full SQL grammar (e.g. node-sql-parser) for
 * production breadth.
 */
import type { CanonicalSchema, CanonicalType, Entity, Field, Relationship } from '@etl/schema-model';

function mapSqlType(raw: string): CanonicalType {
  const s = raw.toLowerCase();
  if (/int|serial/.test(s)) return 'integer';
  if (/numeric|decimal|money/.test(s)) return 'decimal';
  if (/real|double|float/.test(s)) return 'float';
  if (/bool/.test(s)) return 'boolean';
  if (/timestamptz/.test(s)) return 'timestamptz';
  if (/timestamp|datetime/.test(s)) return 'datetime';
  if (/date/.test(s)) return 'date';
  if (/uuid/.test(s)) return 'uuid';
  if (/json/.test(s)) return 'json';
  if (/text|char|varchar/.test(s)) return 'string';
  return 'string';
}

/** Parse a subset of SQL DDL (CREATE TABLE ...) into canonical entities. */
export function parseDdl(sql: string, name = 'ddl-import'): CanonicalSchema {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(sql))) {
    const tableName = m[1]!;
    const body = m[2]!;
    const fields: Field[] = [];
    const pk: string[] = [];
    const lines = body.split(',').map((l) => l.trim());
    let ordinal = 0;
    for (const line of lines) {
      const pkInline = /primary\s+key\s*\(([^)]+)\)/i.exec(line);
      if (pkInline) {
        pkInline[1]!.split(',').forEach((c) => pk.push(c.trim().replace(/["`]/g, '')));
        continue;
      }
      // Table-level foreign key: FOREIGN KEY (col) REFERENCES other(col)
      const tableFk = /foreign\s+key\s*\(([^)]+)\)\s+references\s+["`]?(\w+)["`]?(?:\s*\(([^)]+)\))?/i.exec(line);
      if (tableFk) {
        addRelationship(relationships, tableName, tableFk[1]!, tableFk[2]!, tableFk[3]);
        continue;
      }
      const col = /^["`]?(\w+)["`]?\s+([\w()]+)(.*)$/.exec(line);
      if (!col) continue;
      const colName = col[1]!;
      const rest = (col[3] ?? '').toLowerCase();
      const isPk = /primary\s+key/.test(rest);
      if (isPk) pk.push(colName);
      // Column-level foreign key: col type REFERENCES other(col)
      const colFk = /references\s+["`]?(\w+)["`]?(?:\s*\(([^)]+)\))?/i.exec(col[3] ?? '');
      if (colFk) addRelationship(relationships, tableName, colName, colFk[1]!, colFk[2]);
      fields.push({
        id: `${tableName}.${colName}`,
        name: colName,
        ordinal: ordinal++,
        dataType: mapSqlType(col[2]!),
        nativeType: col[2],
        nullable: !/not\s+null/.test(rest) && !isPk,
        isPrimaryKey: isPk,
        isForeignKey: Boolean(colFk),
      });
    }
    for (const f of fields) if (pk.includes(f.name)) f.isPrimaryKey = true;
    entities.push({ id: tableName, name: tableName, kind: 'table', classification: 'unknown', fields, primaryKey: pk });
  }
  return {
    id: name,
    name,
    intakeMethod: 'ddl_upload',
    entities,
    relationships,
    provenance: { source: 'ddl' },
    createdAt: new Date().toISOString(),
  };
}

function addRelationship(
  out: Relationship[],
  fromEntity: string,
  fromCols: string,
  toEntity: string,
  toCols?: string,
): void {
  const from = fromCols.split(',').map((c) => c.trim().replace(/["`]/g, ''));
  const to = (toCols ?? 'id').split(',').map((c) => c.trim().replace(/["`]/g, ''));
  out.push({
    id: `${fromEntity}_${from.join('_')}_fk`,
    fromEntityId: fromEntity,
    fromFields: from,
    toEntityId: toEntity,
    toFields: to,
    cardinality: 'one_to_many',
    declared: true,
    certainty: 'confirmed',
    evidence: [{ kind: 'foreign_key', detail: `${fromEntity}.${from.join(',')} references ${toEntity}` }],
  });
}

export interface DictionaryRow {
  entity: string;
  field: string;
  type?: string;
  nullable?: string;
  description?: string;
}

/** Parse a tabular data dictionary (already read into rows) into a schema. */
export function parseDataDictionary(rows: DictionaryRow[], name = 'dictionary-import'): CanonicalSchema {
  const entities = new Map<string, Entity>();
  let ordinal = 0;
  for (const r of rows) {
    let e = entities.get(r.entity);
    if (!e) {
      e = { id: r.entity, name: r.entity, kind: 'table', classification: 'unknown', fields: [] };
      entities.set(r.entity, e);
    }
    e.fields.push({
      id: `${r.entity}.${r.field}`,
      name: r.field,
      ordinal: ordinal++,
      dataType: r.type ? mapSqlType(r.type) : 'string',
      nativeType: r.type,
      nullable: (r.nullable ?? 'yes').toLowerCase().startsWith('y'),
      isPrimaryKey: false,
      isForeignKey: false,
      description: r.description,
    });
  }
  return {
    id: name,
    name,
    intakeMethod: 'data_dictionary',
    entities: [...entities.values()],
    relationships: [],
    provenance: { source: 'dictionary' },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Parse an OpenAPI/Swagger document's component schemas into canonical entities.
 * Endpoints/auth/pagination extraction is a follow-up; this covers request/
 * response object shapes needed for mapping.
 */
export function parseOpenApi(doc: Record<string, any>, name = 'openapi-import'): CanonicalSchema {
  const schemas = doc.components?.schemas ?? doc.definitions ?? {};
  const entities: Entity[] = [];
  for (const [entityName, def] of Object.entries<any>(schemas)) {
    const props = def.properties ?? {};
    const required: string[] = def.required ?? [];
    const fields: Field[] = Object.entries<any>(props).map(([fieldName, p], i) => ({
      id: `${entityName}.${fieldName}`,
      name: fieldName,
      ordinal: i,
      dataType: openApiType(p),
      nativeType: p.format ?? p.type,
      nullable: !required.includes(fieldName),
      isPrimaryKey: fieldName === 'id',
      isForeignKey: false,
      description: p.description,
      annotations: p.enum ? { enumValues: p.enum.map(String) } : undefined,
    }));
    entities.push({ id: entityName, name: entityName, kind: 'object', classification: 'unknown', fields });
  }
  return {
    id: name,
    name,
    intakeMethod: 'openapi',
    entities,
    relationships: [],
    provenance: { source: 'openapi', title: doc.info?.title },
    createdAt: new Date().toISOString(),
  };
}

function openApiType(p: any): CanonicalType {
  switch (p.type) {
    case 'integer':
      return 'integer';
    case 'number':
      return 'decimal';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'json';
    case 'string':
      if (p.format === 'date-time') return 'datetime';
      if (p.format === 'date') return 'date';
      if (p.format === 'uuid') return 'uuid';
      return 'string';
    default:
      return 'unknown';
  }
}
