/**
 * Deterministic source-system understanding (Phase 4).
 *
 * Builds an evidence-backed overview of a source schema: likely purpose and
 * entity per table, classification (transaction/lookup/audit/config/…),
 * important fields, suggested join paths, and the areas a human should confirm.
 * Every conclusion carries a certainty and evidence — nothing is asserted as
 * fact without support. An LLM (when configured) enriches the prose.
 */
import type { CanonicalSchema, Entity } from '@etl/schema-model';
import type { Certainty, Evidence } from '@etl/shared-types';

export interface TableInsight {
  entityRef: string;
  likelyPurpose: string;
  likelyEntity: string;
  classification: string;
  importantFields: string[];
  certainty: Certainty;
  evidence: Evidence[];
  needsUserConfirmation: boolean;
}

export interface Overview {
  tables: TableInsight[];
  suggestedJoinPaths: Array<{ from: string; to: string; via: string; certainty: Certainty }>;
  areasRequiringConfirmation: string[];
}

const has = (name: string, ...needles: string[]) => needles.some((n) => name.includes(n));

function classify(entity: Entity, referencedBy: Set<string>): { classification: string; certainty: Certainty; why: string } {
  const name = entity.name.toLowerCase();
  const fkCount = entity.fields.filter((f) => f.isForeignKey).length;
  const hasAmount = entity.fields.some((f) => has(f.name.toLowerCase(), 'amount', 'amt', 'balance', 'bal', 'total'));
  const hasDate = entity.fields.some((f) => ['date', 'datetime', 'timestamptz'].includes(f.dataType));
  const codeCols = entity.fields.filter((f) => has(f.name.toLowerCase(), 'code', 'cd', 'desc', 'name')).length;

  if (has(name, 'audit', 'history', 'hist', '_log', 'changelog'))
    return { classification: 'audit', certainty: 'strong_inference', why: 'name indicates an audit/history table' };
  if (has(name, 'archive', 'deprecated', '_old', '_bak'))
    return { classification: 'archive', certainty: 'strong_inference', why: 'name indicates archived/deprecated data' };
  if (has(name, 'config', 'setting', 'param'))
    return { classification: 'config', certainty: 'strong_inference', why: 'name indicates configuration' };
  if (fkCount === 2 && entity.fields.length <= 4 && (entity.primaryKey?.length ?? 0) >= 2)
    return { classification: 'junction', certainty: 'weak_assumption', why: 'two foreign keys forming a composite key' };
  if (has(name, 'transaction', 'txn', 'payment', 'pmt', 'invoice', 'order', 'ledger', 'entry') || (hasAmount && hasDate && fkCount >= 1))
    return { classification: 'transaction', certainty: hasAmount && hasDate ? 'strong_inference' : 'weak_assumption', why: 'monetary + dated + related to a parent' };
  if ((entity.fields.length <= 5 && codeCols >= 1) || has(name, 'type', 'status', 'lookup', 'ref_'))
    return { classification: 'lookup', certainty: 'weak_assumption', why: 'small table of codes/descriptions' };
  if (referencedBy.has(entity.name) && (entity.primaryKey?.length ?? 0) > 0)
    return { classification: 'core', certainty: 'strong_inference', why: 'has a primary key and is referenced by other tables' };
  return { classification: 'core', certainty: 'needs_confirmation', why: 'default classification — needs confirmation' };
}

function likelyEntityName(name: string): string {
  const singular = name.replace(/s$/, '');
  return singular.replace(/_/g, ' ');
}

export function buildOverview(schema: CanonicalSchema): Overview {
  const referencedBy = new Set<string>();
  for (const r of schema.relationships) referencedBy.add(r.toEntityId);

  const tables: TableInsight[] = schema.entities.map((entity) => {
    const { classification, certainty, why } = classify(entity, referencedBy);
    const evidence: Evidence[] = [{ kind: 'table_name', detail: `table "${entity.name}"`, ref: entity.id }];

    const importantFields = entity.fields
      .filter(
        (f) =>
          f.isPrimaryKey ||
          f.isForeignKey ||
          has(f.name.toLowerCase(), 'name', 'amount', 'balance', 'date', 'status', 'email', 'code'),
      )
      .map((f) => f.name)
      .slice(0, 8);
    for (const f of entity.fields.filter((x) => x.isForeignKey)) {
      evidence.push({ kind: 'foreign_key', detail: `${entity.name}.${f.name} is a foreign key` });
    }

    return {
      entityRef: entity.id,
      likelyPurpose: `${why}. Likely stores ${likelyEntityName(entity.name)} records.`,
      likelyEntity: likelyEntityName(entity.name),
      classification,
      importantFields,
      certainty,
      evidence,
      needsUserConfirmation: certainty === 'needs_confirmation' || certainty === 'weak_assumption',
    };
  });

  const suggestedJoinPaths = schema.relationships.map((r) => ({
    from: r.fromEntityId,
    to: r.toEntityId,
    via: `${r.fromFields.join(',')} → ${r.toFields.join(',')}`,
    certainty: r.certainty,
  }));

  const areasRequiringConfirmation: string[] = [];
  for (const e of schema.entities) {
    if (!(e.primaryKey?.length ?? 0)) areasRequiringConfirmation.push(`"${e.name}" has no detected primary key`);
  }
  for (const r of schema.relationships) {
    if (!r.declared) areasRequiringConfirmation.push(`Relationship ${r.fromEntityId} → ${r.toEntityId} is inferred, not declared`);
  }

  return { tables, suggestedJoinPaths, areasRequiringConfirmation };
}
