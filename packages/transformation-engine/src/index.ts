/**
 * @etl/transformation-engine
 *
 * Deterministic executor for per-value transformation steps. Row/batch-level
 * steps (deduplicate, aggregate, multi_table_join) are handled by the worker's
 * DuckDB stage and are recognised-but-skipped here.
 *
 * Pure: no I/O, no clock, no randomness (except explicit lookups resolved via
 * ctx). Safe to run per-record at scale and to unit-test exhaustively.
 */
import type { Condition, TransformationConfig, TransformationStep } from './types.js';

export * from './types.js';

/** Deterministic resolvers the caller injects (reference data, FX rates, lookups). */
export interface TransformContext {
  lookup?: (tableId: string, value: unknown) => unknown;
  reference?: (setId: string, key: unknown, returnField: string) => unknown;
  fxRate?: (source: string, from: string, to: string) => number;
}

export interface TransformResult {
  value: unknown;
  warnings: string[];
  /** Signals the record should be rejected (e.g. null_handling strategy 'reject'). */
  reject?: { reason: string };
}

const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

function evalCondition(cond: Condition, value: unknown): boolean {
  switch (cond.op) {
    case 'eq':
      return value === cond.value;
    case 'neq':
      return value !== cond.value;
    case 'gt':
      return (value as number) > (cond.value as number);
    case 'gte':
      return (value as number) >= (cond.value as number);
    case 'lt':
      return (value as number) < (cond.value as number);
    case 'lte':
      return (value as number) <= (cond.value as number);
    case 'in':
      return cond.values.includes(value);
    case 'not_in':
      return !cond.values.includes(value);
    case 'is_null':
      return value === null || value === undefined;
    case 'is_not_null':
      return value !== null && value !== undefined;
    case 'is_empty':
      return isEmpty(value);
    case 'is_not_empty':
      return !isEmpty(value);
    case 'matches':
      return typeof value === 'string' && new RegExp(cond.pattern).test(value);
    default:
      return false;
  }
}

/** Row/batch-level kinds handled downstream (DuckDB), not per-value. */
const BATCH_LEVEL = new Set<TransformationStep['kind']>([
  'deduplicate',
  'aggregate',
  'multi_table_join',
]);

function applyStep(step: TransformationStep, value: unknown, ctx: TransformContext): TransformResult {
  const warnings: string[] = [];
  const s = value == null ? '' : String(value);

  switch (step.kind) {
    case 'rename':
      return { value, warnings }; // rename is structural; value passes through
    case 'trim':
      return { value: s.replace(/^\s+|\s+$/g, ''), warnings };
    case 'uppercase':
      return { value: s.toUpperCase(), warnings };
    case 'lowercase':
      return { value: s.toLowerCase(), warnings };
    case 'replace': {
      const { find, replace, regex } = step.params;
      return { value: regex ? s.replace(new RegExp(find, 'g'), replace) : s.split(find).join(replace), warnings };
    }
    case 'concatenate': {
      const parts = Array.isArray(value) ? value : [value];
      return { value: parts.map((p) => (p == null ? '' : String(p))).join(step.params.separator ?? ''), warnings };
    }
    case 'split':
      return { value: s.split(step.params.separator, step.params.limit), warnings };
    case 'substring':
      return { value: s.substring(step.params.start, step.params.length != null ? step.params.start + step.params.length : undefined), warnings };
    case 'parse_date': {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) {
        warnings.push(`Could not parse date "${s}"`);
        return { value: null, warnings };
      }
      return { value: d.toISOString(), warnings };
    }
    case 'format_date': {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return { value: null, warnings: [`Invalid date "${s}"`] };
      // Minimal formatter; real impl uses a date lib honouring params.format/timezone.
      return { value: d.toISOString().slice(0, 10), warnings };
    }
    case 'to_number': {
      const cleaned = s
        .split(step.params?.thousandsSeparator ?? ',')
        .join('')
        .replace(step.params?.decimalSeparator ?? '.', '.');
      const n = Number(cleaned);
      if (Number.isNaN(n)) return { value: null, warnings: [`Not a number: "${s}"`] };
      return { value: n, warnings };
    }
    case 'to_boolean': {
      if (step.params.trueValues.includes(s)) return { value: true, warnings };
      if (step.params.falseValues.includes(s)) return { value: false, warnings };
      return { value: null, warnings: [`Unrecognised boolean "${s}"`] };
    }
    case 'default_value':
      return { value: isEmpty(value) ? step.params.value : value, warnings };
    case 'conditional_value': {
      for (const c of step.params.cases) if (evalCondition(c.when, value)) return { value: c.then, warnings };
      return { value: step.params.else ?? value, warnings };
    }
    case 'lookup_translation': {
      const out = ctx.lookup?.(step.params.lookupTableId, value);
      if (out === undefined) {
        if (step.params.onMiss === 'reject') return { value: null, warnings, reject: { reason: `Lookup miss for "${s}"` } };
        if (step.params.onMiss === 'passthrough') return { value, warnings };
        return { value: null, warnings: [`Lookup miss for "${s}"`] };
      }
      return { value: out, warnings };
    }
    case 'null_handling': {
      if (!isEmpty(value)) return { value, warnings };
      if (step.params.strategy === 'reject') return { value: null, warnings, reject: { reason: 'Required value is null/empty' } };
      if (step.params.strategy === 'to_default') return { value: step.params.default ?? null, warnings };
      return { value: null, warnings };
    }
    case 'regex_extract': {
      const m = s.match(new RegExp(step.params.pattern));
      return { value: m ? m[step.params.group ?? 0] ?? null : null, warnings };
    }
    case 'arithmetic': {
      const n = Number(value);
      if (Number.isNaN(n)) return { value: null, warnings: [`Cannot do arithmetic on "${s}"`] };
      const { op, operand } = step.params;
      const r = op === '+' ? n + operand : op === '-' ? n - operand : op === '*' ? n * operand : n / operand;
      return { value: r, warnings };
    }
    case 'currency_config': {
      const rate = ctx.fxRate?.(step.params.rateSource, step.params.fromCurrency, step.params.toCurrency);
      const n = Number(value);
      if (rate == null || Number.isNaN(n)) return { value, warnings: ['FX rate unavailable; value unchanged'] };
      return { value: n * rate, warnings };
    }
    case 'reference_lookup':
      return { value: ctx.reference?.(step.params.referenceSetId, value, step.params.returnField) ?? null, warnings };
    case 'source_priority': {
      const arr = Array.isArray(value) ? value : [value];
      return { value: arr.find((v) => !isEmpty(v)) ?? null, warnings };
    }
    default:
      // Batch-level kinds: pass through untouched (handled by DuckDB stage).
      if (BATCH_LEVEL.has((step as TransformationStep).kind)) return { value, warnings };
      return { value, warnings: [`Unknown transformation kind`] };
  }
}

/** Apply a full transformation config (ordered steps) to a single value. */
export function applyTransformation(
  config: TransformationConfig,
  input: unknown,
  ctx: TransformContext = {},
): TransformResult {
  let value = input;
  const warnings: string[] = [];
  for (const step of config.steps) {
    const result = applyStep(step, value, ctx);
    warnings.push(...result.warnings);
    if (result.reject) return { value: null, warnings, reject: result.reject };
    value = result.value;
  }
  return { value, warnings };
}
