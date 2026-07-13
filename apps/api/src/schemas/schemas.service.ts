import { randomUUID, createHash } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { ConnectorType, LineageContext } from '@etl/shared-types';
import type { CanonicalSchema, CanonicalType, Entity, Field } from '@etl/schema-model';
import { prisma } from '@etl/database';
import { createConnectorRegistry, CsvConnector, JsonConnector, XmlConnector } from '@etl/connectors';
import { createSecretsProvider } from '@etl/secrets';
import {
  parseDdl,
  parseDataDictionary,
  parseOpenApi,
  parseFixedWidthLayout,
  readFixedWidthLine,
  type DictionaryRow,
} from '@etl/schema-discovery';
import { profileSample } from '@etl/profiling';
import { ObjectStore, loadStorageConfig } from '@etl/storage';
import { recordAudit } from '@etl/audit';
import { buildOverview } from './overview.js';

const registry = createConnectorRegistry();
const secrets = createSecretsProvider(process.env.SECRETS_PROVIDER ?? 'env', process.env.AWS_REGION);

/**
 * Schema intake service (Phase 3).
 *
 * Turns every intake method — DB introspection, DDL, data dictionary, sample
 * file, OpenAPI — into the canonical schema model and persists it. Intake work
 * here is metadata-scale (introspection queries, parsing, bounded sampling), so
 * it runs inline; large-file/data-movement work stays in the Temporal workers.
 */
@Injectable()
export class SchemasService {
  list(tenantId: string) {
    return prisma.schemaModel.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, intakeMethod: true, connectionId: true, createdAt: true },
    });
  }

  async get(tenantId: string, id: string) {
    const row = await prisma.schemaModel.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Schema not found');
    const profiles = await prisma.profileResult.findMany({ where: { schemaModelId: id } });
    return { ...row, profiles };
  }

  private async persist(
    lineage: Pick<LineageContext, 'tenantId'> & { actorId?: string },
    schema: CanonicalSchema,
    connectionId?: string,
  ) {
    const saved = await prisma.schemaModel.create({
      data: {
        tenantId: lineage.tenantId,
        connectionId: connectionId ?? null,
        name: schema.name,
        intakeMethod: schema.intakeMethod,
        model: schema as unknown as object,
        provenance: (schema.provenance ?? {}) as object,
      },
    });
    await recordAudit({
      lineage: { tenantId: lineage.tenantId },
      actorId: lineage.actorId,
      action: 'schema.ingested',
      subjectType: 'SchemaModel',
      subjectId: saved.id,
      after: { name: schema.name, method: schema.intakeMethod, entities: schema.entities.length },
    });
    return saved;
  }

  /** DB introspection via the connector (metadata only; no data movement). */
  async discoverFromConnection(tenantId: string, connectionId: string, actorId?: string) {
    const conn = await prisma.connection.findFirst({ where: { id: connectionId, tenantId } });
    if (!conn) throw new NotFoundException('Connection not found');
    const connector = registry.get(conn.connectorType as ConnectorType);
    if (!connector.discoverSchema) {
      throw new NotFoundException(`Connector ${conn.connectorType} cannot discover schema`);
    }
    const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
    const schema = await connector.discoverSchema(
      {
        connectionId: conn.id,
        connectorType: conn.connectorType as ConnectorType,
        config: conn.config as Record<string, unknown>,
        secrets: resolved,
      },
      { estimateRowCounts: true, detectRelationships: true },
    );
    const saved = await this.persist({ tenantId, actorId }, schema, connectionId);
    return { schemaModelId: saved.id, entities: schema.entities.length, relationships: schema.relationships.length };
  }

  async ingestDdl(tenantId: string, name: string, ddl: string, actorId?: string) {
    const schema = parseDdl(ddl, name);
    const saved = await this.persist({ tenantId, actorId }, schema);
    return { schemaModelId: saved.id, entities: schema.entities.length };
  }

  async ingestOpenApi(tenantId: string, name: string, doc: Record<string, unknown>, actorId?: string) {
    const schema = parseOpenApi(doc, name);
    const saved = await this.persist({ tenantId, actorId }, schema);
    return { schemaModelId: saved.id, entities: schema.entities.length };
  }

  /** Data dictionary provided as CSV text with columns entity,field,type,nullable,description. */
  async ingestDictionary(tenantId: string, name: string, csv: string, actorId?: string) {
    const rows = parseDictionaryCsv(csv);
    const schema = parseDataDictionary(rows, name);
    const saved = await this.persist({ tenantId, actorId }, schema);
    return { schemaModelId: saved.id, entities: schema.entities.length };
  }

  /**
   * Sample file upload (CSV / delimited / JSON / XML). Infers a schema and
   * profiles a bounded sample (null rates, distinct, formats, PII, duplicates).
   */
  async ingestSample(
    tenantId: string,
    opts: {
      name: string;
      format: 'csv' | 'json' | 'xml' | 'delimited';
      content: string;
      entityName?: string;
      delimiter?: string;
      recordPath?: string;
    },
    actorId?: string,
  ) {
    const entityName = opts.entityName ?? opts.name.replace(/\.[^.]+$/, '');
    const ext = opts.format === 'json' ? 'json' : opts.format === 'xml' ? 'xml' : 'txt';
    const tmp = join(tmpdir(), `etl-sample-${randomUUID()}.${ext}`);
    await writeFile(tmp, opts.content, 'utf8');
    try {
      const connector =
        opts.format === 'json' ? new JsonConnector() : opts.format === 'xml' ? new XmlConnector() : new CsvConnector();
      const rt = {
        connectionId: 'inline-sample',
        connectorType: opts.format as ConnectorType,
        config: { filePath: tmp, sampleRows: 500, delimiter: opts.delimiter, recordPath: opts.recordPath },
        secrets: {},
      };
      const entity: Entity = await connector.inferSchema!(rt, entityName);

      // Collect a bounded sample for richer profiling.
      const records: Record<string, unknown>[] = [];
      for await (const batch of connector.read!(rt, { entity: entityName, limit: 1000, batchSize: 1000 })) {
        records.push(...batch.records);
        if (records.length >= 1000) break;
      }
      const stats = profileSample(records);

      // Merge profiling annotations back onto the inferred fields.
      const byName = new Map(stats.map((s) => [s.field, s]));
      for (const f of entity.fields) {
        const s = byName.get(f.name);
        if (!s) continue;
        f.profile = { ...(f.profile ?? {}), ...s };
        f.annotations = {
          ...(f.annotations ?? {}),
          pii: s.pii,
          detectedFormat: s.detectedFormat,
          isLikelyIdentifier: s.isLikelyIdentifier,
        };
      }

      const schema: CanonicalSchema = {
        id: `${entityName}-sample`,
        name: opts.name,
        intakeMethod: 'sample_inference',
        entities: [entity],
        relationships: [],
        provenance: { source: 'sample', format: opts.format, rowsSampled: records.length },
        createdAt: new Date().toISOString(),
      };
      const saved = await this.persist({ tenantId, actorId }, schema);
      await prisma.profileResult.create({
        data: {
          tenantId,
          schemaModelId: saved.id,
          entityName,
          stats: { fields: stats } as object,
        },
      });
      return { schemaModelId: saved.id, entities: 1, fields: entity.fields.length, rowsSampled: records.length };
    } finally {
      await unlink(tmp).catch(() => undefined);
    }
  }

  /**
   * Fixed-width intake driven by documentation. Parses the record-layout doc
   * into field positions (no bespoke plugin), builds the canonical schema, and
   * — if a data sample is supplied — profiles it using the derived layout. The
   * layout is stored in provenance so a connection can read the real file later.
   */
  async ingestFixedWidth(
    tenantId: string,
    opts: { name: string; layoutDoc: string; sample?: string; entityName?: string },
    actorId?: string,
  ) {
    const layout = parseFixedWidthLayout(opts.layoutDoc);
    if (layout.length === 0) {
      throw new BadRequestException('Could not derive any fields from the layout documentation');
    }
    const entityName = opts.entityName ?? opts.name.replace(/\.[^.]+$/, '');
    const fwCanonical = (t: string | undefined): CanonicalType =>
      t === 'number' ? 'decimal' : t === 'date' ? 'date' : t === 'boolean' ? 'boolean' : 'string';

    const fields: Field[] = layout.map((f, i) => ({
      id: `${entityName}.${f.name}`,
      name: f.name,
      ordinal: i,
      dataType: fwCanonical(f.type),
      nativeType: `fixed(${f.start},${f.width})`,
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      description: f.description,
      annotations: { detectedFormat: `fixed-width @${f.start}+${f.width}` },
    }));

    let rowsSampled = 0;
    let stats: ReturnType<typeof profileSample> = [];
    if (opts.sample) {
      const records = opts.sample
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0)
        .slice(0, 1000)
        .map((line) => readFixedWidthLine(line, layout));
      rowsSampled = records.length;
      stats = profileSample(records);
      const byName = new Map(stats.map((s) => [s.field, s]));
      for (const f of fields) {
        const s = byName.get(f.name);
        if (!s) continue;
        f.profile = { ...(f.profile ?? {}), ...s };
        f.annotations = { ...(f.annotations ?? {}), pii: s.pii, isLikelyIdentifier: s.isLikelyIdentifier };
      }
    }

    const schema: CanonicalSchema = {
      id: `${entityName}-fixedwidth`,
      name: opts.name,
      intakeMethod: 'fixed_width',
      entities: [{ id: entityName, name: entityName, kind: 'file', classification: 'unknown', fields }],
      relationships: [],
      provenance: { source: 'fixed_width', layout, rowsSampled },
      createdAt: new Date().toISOString(),
    };
    const saved = await this.persist({ tenantId, actorId }, schema);
    if (stats.length) {
      await prisma.profileResult.create({
        data: { tenantId, schemaModelId: saved.id, entityName, stats: { fields: stats } as object },
      });
    }
    return { schemaModelId: saved.id, entities: 1, fields: fields.length, rowsSampled, layout };
  }

  /**
   * Generate (and persist) the AI-assisted source-system overview. Uses the
   * deterministic understanding engine as the backbone; an LLM enriches it when
   * configured. Advisory only — nothing here is executable config.
   */
  async generateOverview(tenantId: string, schemaModelId: string, actorId?: string) {
    const row = await prisma.schemaModel.findFirst({ where: { id: schemaModelId, tenantId } });
    if (!row) throw new NotFoundException('Schema not found');
    const schema = row.model as unknown as CanonicalSchema;
    const overview = buildOverview(schema);
    const generatedBy = 'heuristic';

    const saved = await prisma.sourceOverview.create({
      data: { tenantId, schemaModelId, summary: { ...overview, generatedBy } as object },
    });
    await recordAudit({
      lineage: { tenantId },
      actorId,
      action: 'schema.overview.generated',
      subjectType: 'SourceOverview',
      subjectId: saved.id,
      after: { tables: overview.tables.length },
    });
    return { id: saved.id, generatedBy, ...overview };
  }

  /** Latest stored overview for a schema, generating one on first request. */
  async getOverview(tenantId: string, schemaModelId: string) {
    const existing = await prisma.sourceOverview.findFirst({
      where: { tenantId, schemaModelId },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return { id: existing.id, ...(existing.summary as object) };
    return this.generateOverview(tenantId, schemaModelId);
  }

  /**
   * Create an immutable schema snapshot: content-hashed canonical JSON stored in
   * object storage, referenced by a SchemaSnapshot row (used for drift
   * detection and version pinning).
   */
  async snapshot(tenantId: string, schemaModelId: string, actorId?: string) {
    const row = await prisma.schemaModel.findFirst({ where: { id: schemaModelId, tenantId } });
    if (!row) throw new NotFoundException('Schema not found');
    const json = JSON.stringify(row.model);
    const checksum = createHash('sha256').update(json).digest('hex');

    const store = new ObjectStore(loadStorageConfig());
    const key = ObjectStore.key({ tenantId, kind: 'snapshot', filename: `${schemaModelId}-${checksum.slice(0, 12)}.json` });
    await store.putObject(key, json);

    const snapshot = await prisma.schemaSnapshot.create({
      data: { tenantId, schemaModelId, checksum, storageKey: key },
    });
    await recordAudit({
      lineage: { tenantId },
      actorId,
      action: 'schema.snapshot.created',
      subjectType: 'SchemaSnapshot',
      subjectId: snapshot.id,
      after: { checksum, storageKey: key },
    });
    return { snapshotId: snapshot.id, checksum, storageKey: key };
  }
}

/** Parse a data-dictionary CSV into typed rows (header-driven, tolerant). */
function parseDictionaryCsv(csv: string): DictionaryRow[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h === name || h.includes(name));
  const iEntity = idx('entity') >= 0 ? idx('entity') : idx('table');
  const iField = idx('field') >= 0 ? idx('field') : idx('column');
  const iType = idx('type');
  const iNullable = idx('nullable');
  const iDesc = idx('desc');
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    return {
      entity: cells[iEntity] ?? 'unknown',
      field: cells[iField] ?? 'unknown',
      type: iType >= 0 ? cells[iType] : undefined,
      nullable: iNullable >= 0 ? cells[iNullable] : undefined,
      description: iDesc >= 0 ? cells[iDesc] : undefined,
    };
  });
}
