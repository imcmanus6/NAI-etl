/**
 * @etl/validation-engine
 *
 * Deterministic evaluator for record- and field-level validation rules.
 * Cross-table / batch / destination rules (referential integrity, duplicate
 * detection, balance reconciliation) are evaluated by the worker's DuckDB stage
 * and are recognised-but-skipped here.
 */
import type {
  RecordValidationResult,
  ValidationFailure,
  ValidationRule,
  ValidationSet,
} from './types.js';

export * from './types.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCY = /^[A-Z]{3}$/;
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** Rules that require the full batch / other tables — not per-record. */
const BATCH_LEVEL = new Set<ValidationRule['level']>([
  'cross_table',
  'batch',
  'destination',
  'schema',
  'file',
]);

const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

function get(record: Record<string, unknown>, ref: string): unknown {
  return record[ref] ?? record[ref.split('.').pop() as string];
}

function evalRule(rule: ValidationRule, record: Record<string, unknown>): ValidationFailure | null {
  const field = rule.fields[0];
  const value = field ? get(record, field) : undefined;
  const fail = (message: string): ValidationFailure => ({
    ruleId: rule.id,
    ruleType: rule.ruleType,
    level: rule.level,
    field,
    severity: rule.severity,
    message: rule.message ?? message,
    value,
  });

  switch (rule.ruleType) {
    case 'required':
      return isEmpty(value) ? fail(`${field} is required`) : null;
    case 'valid_date':
      return isEmpty(value) || !Number.isNaN(new Date(String(value)).getTime())
        ? null
        : fail(`${field} is not a valid date`);
    case 'allowed_value': {
      const allowed = (rule.params.values as unknown[]) ?? [];
      return isEmpty(value) || allowed.includes(value) ? null : fail(`${field} has a disallowed value`);
    }
    case 'min_length':
      return isEmpty(value) || String(value).length >= Number(rule.params.min)
        ? null
        : fail(`${field} is too short`);
    case 'max_length':
      return isEmpty(value) || String(value).length <= Number(rule.params.max)
        ? null
        : fail(`${field} is too long`);
    case 'numeric_range': {
      if (isEmpty(value)) return null;
      const n = Number(value);
      const { min, max } = rule.params as { min?: number; max?: number };
      if (Number.isNaN(n)) return fail(`${field} is not numeric`);
      if (min != null && n < min) return fail(`${field} is below minimum`);
      if (max != null && n > max) return fail(`${field} is above maximum`);
      return null;
    }
    case 'valid_email':
      return isEmpty(value) || EMAIL.test(String(value)) ? null : fail(`${field} is not a valid email`);
    case 'valid_postcode':
      return isEmpty(value) || UK_POSTCODE.test(String(value)) ? null : fail(`${field} is not a valid postcode`);
    case 'valid_currency_code':
      return isEmpty(value) || CURRENCY.test(String(value)) ? null : fail(`${field} is not a valid currency code`);
    case 'regex_match':
      return isEmpty(value) || new RegExp(String(rule.params.pattern)).test(String(value))
        ? null
        : fail(`${field} does not match the required pattern`);
    case 'cross_field_compare': {
      const other = get(record, String(rule.params.otherField));
      const op = String(rule.params.op);
      const ok =
        (op === 'eq' && value === other) ||
        (op === 'neq' && value !== other) ||
        (op === 'gt' && (value as number) > (other as number)) ||
        (op === 'lt' && (value as number) < (other as number));
      return ok ? null : fail(`${field} failed comparison with ${rule.params.otherField}`);
    }
    default:
      // Batch-level rule types are evaluated elsewhere.
      return null;
  }
}

/** Validate a single record against the record/field-level rules of a set. */
export function validateRecord(
  set: ValidationSet,
  record: Record<string, unknown>,
  recordKey: string,
): RecordValidationResult {
  const failures: ValidationFailure[] = [];
  for (const rule of set.rules) {
    if (BATCH_LEVEL.has(rule.level)) continue;
    const f = evalRule(rule, record);
    if (f) failures.push(f);
  }
  const passed = !failures.some((f) => f.severity === 'reject');
  return { recordKey, passed, failures };
}
