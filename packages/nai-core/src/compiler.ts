/**
 * @nai/core — deterministic IR → SQL compiler (Postgres dialect for the demo).
 *
 * Only the compiler produces SQL — the AI never does. Every field/metric
 * resolves through the catalog; values are coerced/escaped; the result is then
 * checked by the SQL Guard before it can run against the read-only DB.
 */
import { FIELDS, METRICS } from './catalog.js';
import { applySchema } from './schema.js';
import { isPredicateLeaf, type FilterNode, type MetricQuery, type Operator, type PopulationQuery, type Predicate } from './ir.js';

function lit(v: string | number | undefined): string {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error('non-finite numeric literal');
    return String(v);
  }
  if (typeof v === 'string') {
    if (!/^[\w .,'@%/-]{0,64}$/.test(v)) throw new Error(`unsafe string literal: ${v}`);
    return `'${v.replace(/'/g, "''")}'`;
  }
  return 'null';
}

function predSql(p: Predicate): string {
  const f = FIELDS[p.field];
  if (!f) throw new Error(`unknown field: ${p.field}`);
  const c = f.column;
  const days = () => {
    const n = Number(p.value);
    if (!Number.isInteger(n) || n < 0 || n > 3650) throw new Error('invalid day count');
    return n;
  };
  const scalar = () => (Array.isArray(p.value) ? p.value[0] : p.value) as string | number | undefined;
  const list = () => {
    const arr = Array.isArray(p.value) ? p.value : p.value == null ? [] : [p.value];
    if (arr.length === 0) return null;
    if (arr.length > 500) throw new Error('list too long');
    return arr.map((v) => lit(v as string | number)).join(', ');
  };
  switch (p.operator) {
    case 'older_than_days':
      return `${c} < now() - interval '${days()} days'`;
    case 'within_days':
      return `${c} >= now() - interval '${days()} days'`;
    case 'is_true':
      return `${c} = true`;
    case 'is_false':
      return `${c} = false`;
    case 'is_set':
      return f.type === 'string' ? `(${c} is not null and ${c} <> '')` : `${c} is not null`;
    case 'is_empty':
      return f.type === 'string' ? `(${c} is null or ${c} = '')` : `${c} is null`;
    case 'in': {
      const l = list();
      return l ? `${c} in (${l})` : 'false';
    }
    case 'not_in': {
      const l = list();
      return l ? `${c} not in (${l})` : 'true';
    }
    case 'eq':
      return `${c} = ${lit(scalar())}`;
    case 'neq':
      return `${c} <> ${lit(scalar())}`;
    case 'gt':
      return `${c} > ${lit(scalar())}`;
    case 'gte':
      return `${c} >= ${lit(scalar())}`;
    case 'lt':
      return `${c} < ${lit(scalar())}`;
    case 'lte':
      return `${c} <= ${lit(scalar())}`;
    default:
      throw new Error(`unsupported operator: ${p.operator as Operator}`);
  }
}

export function whereClause(preds: Predicate[]): string {
  return preds.length ? 'where ' + preds.map(predSql).join(' and ') : '';
}

/** Compile a boolean filter tree (AND/OR/NOT of predicates) to a SQL expression. */
export function compileFilter(node: FilterNode): string {
  if (isPredicateLeaf(node)) return predSql(node);
  if ('and' in node) {
    if (!node.and.length) return 'true';
    return '(' + node.and.map(compileFilter).join(' and ') + ')';
  }
  if ('or' in node) {
    if (!node.or.length) return 'false';
    return '(' + node.or.map(compileFilter).join(' or ') + ')';
  }
  if ('not' in node) return `(not ${compileFilter(node.not)})`;
  throw new Error('invalid filter node');
}

const filterWhere = (node?: FilterNode) => (node ? `where ${compileFilter(node)}` : '');

export function compilePopulationSummary(p: PopulationQuery): string {
  return applySchema(`select count(*)::int as accounts, coalesce(sum(current_balance),0)::numeric as balance from reporting.account_current ${whereClause(p.predicates)}`.trim());
}

export function compilePopulationBreakdown(p: PopulationQuery, dim: string): string {
  const f = FIELDS[dim];
  if (!f || !f.dimension) throw new Error(`invalid dimension: ${dim}`);
  return applySchema(`select ${f.column}::text as key, count(*)::int as accounts, coalesce(sum(current_balance),0)::numeric as balance from reporting.account_current ${whereClause(p.predicates)} group by ${f.column} order by accounts desc limit 50`.trim());
}

export function compilePopulationAccounts(p: PopulationQuery, columns: string[], limit = 500): string {
  const cols = columns.map((name) => {
    const f = FIELDS[name];
    if (!f) throw new Error(`invalid column: ${name}`);
    return `${f.column} as ${name}`;
  });
  const n = Math.min(Math.max(1, limit), 5000);
  return applySchema(`select ${cols.join(', ')} from reporting.account_current ${whereClause(p.predicates)} order by current_balance desc limit ${n}`.trim());
}

export function compileMetric(p: MetricQuery): string {
  const m = METRICS[p.metrics[0]!];
  if (!m) throw new Error(`unknown metric: ${p.metrics[0]}`);
  const dims = (p.dimensions ?? []).map((d) => {
    if ((m.from === 'reporting.payment' || m.from === 'reporting.promise') && d === 'collector') return { sql: 'collector_id', alias: 'collector' };
    const f = FIELDS[d];
    if (!f) throw new Error(`invalid dimension: ${d}`);
    if (f.view !== m.from) throw new Error(`dimension "${d}" not available on ${m.from}`);
    return { sql: f.column, alias: d };
  });
  const selDims = dims.map((d) => `${d.sql} as ${d.alias}`);
  // Combine the metric's certified static WHERE with the query's own filters.
  // Filters must reference a column on the metric's view (else they'd hit a
  // column that doesn't exist there).
  const filterParts = (p.filters ?? []).map((f) => {
    const fd = FIELDS[f.field];
    if (!fd) throw new Error(`invalid filter field: ${f.field}`);
    if (fd.view !== m.from) throw new Error(`filter field "${f.field}" not available on ${m.from}`);
    return predSql(f);
  });
  const whereParts = [m.where, ...filterParts].filter(Boolean);
  const wh = whereParts.length ? `where ${whereParts.join(' and ')}` : '';
  const group = dims.length ? `group by ${dims.map((d) => d.sql).join(', ')}` : '';
  const order = dims.length ? `order by ${m.metric_id} desc nulls last` : '';
  const lim = p.limit ? `limit ${Math.min(Math.max(1, p.limit), 1000)}` : '';
  return applySchema(`select ${[...selDims, `${m.expr} as ${m.metric_id}`].join(', ')} from ${m.from} ${wh} ${group} ${order} ${lim}`.replace(/\s+/g, ' ').trim());
}

// --- Inventory search (filter live accounts by a boolean filter tree) -------

/** Count accounts matching a filter tree (read-only, guarded). */
export function compileInventoryCount(filter?: FilterNode): string {
  return applySchema(`select count(*)::int as n from reporting.account_current ${filterWhere(filter)}`.trim());
}

/** The matching account ids (for batch actions / selection). */
export function compileInventoryIds(filter: FilterNode | undefined, limit = 15000): string {
  const n = Math.min(Math.max(1, limit), 50000);
  return applySchema(`select account_id from reporting.account_current ${filterWhere(filter)} order by account_id limit ${n}`.trim());
}

/**
 * Rows with the chosen catalog columns. Small limits page the results grid;
 * large limits (up to the batch-action cap) pull the eligibility columns for a
 * whole selection.
 */
export function compileInventoryRows(filter: FilterNode | undefined, columns: string[], limit = 100): string {
  const cols = columns.map((name) => {
    const f = FIELDS[name];
    if (!f) throw new Error(`invalid column: ${name}`);
    return `${f.column} as ${name}`;
  });
  const n = Math.min(Math.max(1, limit), 50000);
  return applySchema(`select ${cols.join(', ')} from reporting.account_current ${filterWhere(filter)} order by current_balance desc nulls last limit ${n}`.trim());
}
