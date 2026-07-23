/**
 * @nai/core — deterministic IR → SQL compiler (Postgres dialect for the demo).
 *
 * Only the compiler produces SQL — the AI never does. Every field/metric
 * resolves through the catalog; values are coerced/escaped; the result is then
 * checked by the SQL Guard before it can run against the read-only DB.
 */
import { FIELDS, METRICS } from './catalog.js';
import { applySchema } from './schema.js';
import type { MetricQuery, Operator, PopulationQuery, Predicate } from './ir.js';

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
  switch (p.operator) {
    case 'older_than_days':
      return `${c} < now() - interval '${days()} days'`;
    case 'within_days':
      return `${c} >= now() - interval '${days()} days'`;
    case 'is_true':
      return `${c} = true`;
    case 'is_false':
      return `${c} = false`;
    case 'eq':
      return `${c} = ${lit(p.value)}`;
    case 'neq':
      return `${c} <> ${lit(p.value)}`;
    case 'gt':
      return `${c} > ${lit(p.value)}`;
    case 'gte':
      return `${c} >= ${lit(p.value)}`;
    case 'lt':
      return `${c} < ${lit(p.value)}`;
    case 'lte':
      return `${c} <= ${lit(p.value)}`;
    default:
      throw new Error(`unsupported operator: ${p.operator as Operator}`);
  }
}

export function whereClause(preds: Predicate[]): string {
  return preds.length ? 'where ' + preds.map(predSql).join(' and ') : '';
}

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
