/**
 * @etl/profiling — data profiling.
 *
 * Two tiers:
 *  - {@link profileSample} — pure-JS, for sampled rows (used in the API and for
 *    quick previews).
 *  - DuckDB-backed profiling for large files runs in the worker (out-of-core
 *    SQL); this package exposes the shared {@link FieldStats} shape it produces.
 *
 * Detects: null rates, distinct counts, min/max, detected formats (date,
 * currency, email), likely identifiers, duplicates, malformed values, and a
 * first-pass PII classification.
 */
import type { FieldProfile, PiiCategory } from '@etl/schema-model';

export interface FieldStats extends FieldProfile {
  field: string;
  detectedFormat?: string;
  pii?: PiiCategory;
  isLikelyIdentifier?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A phone number by value must have phone-like punctuation or a leading '+';
// a pure run of digits (e.g. a date like 19850412 or an amount) is not a phone.
const PHONE = /^\+?[\d][\d ()-]{6,}$/;
const PHONE_LIKE = /[ ()+-]/;
const CURRENCY = /^[$£€]\s?\d/;
const DATE = /^\d{4}-\d{2}-\d{2}|^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/;

function classifyPii(field: string, values: string[]): PiiCategory {
  const name = field.toLowerCase();
  if (/email/.test(name) || values.some((v) => EMAIL.test(v))) return 'email';
  if (/phone|mobile|tel/.test(name) || values.some((v) => PHONE.test(v) && PHONE_LIKE.test(v))) return 'phone';
  if (/first_?name|last_?name|surname|given|full_?name/.test(name)) return 'name';
  if (/dob|birth/.test(name)) return 'dob';
  if (/ssn|nino|passport|national/.test(name)) return 'national_id';
  if (/iban|account_?no|card|sort_?code/.test(name)) return 'financial';
  if (/address|postcode|zip|city|street/.test(name)) return 'address';
  return 'none';
}

function detectFormat(values: string[]): string | undefined {
  if (values.every((v) => EMAIL.test(v))) return 'email';
  if (values.every((v) => DATE.test(v))) return 'date';
  if (values.every((v) => CURRENCY.test(v))) return 'currency';
  return undefined;
}

/** Profile a single field from sampled string values. */
export function profileField(field: string, rawValues: unknown[]): FieldStats {
  const values = rawValues.map((v) => (v == null ? '' : String(v)));
  const nonEmpty = values.filter((v) => v !== '');
  const distinct = new Set(nonEmpty);
  const counts = new Map<string, number>();
  for (const v of nonEmpty) counts.set(v, (counts.get(v) ?? 0) + 1);
  const duplicateCount = [...counts.values()].filter((c) => c > 1).reduce((a, c) => a + (c - 1), 0);

  const numeric = nonEmpty.filter((v) => /^-?\d+(\.\d+)?$/.test(v)).map(Number);
  const stats: FieldStats = {
    field,
    nullRate: values.length ? (values.length - nonEmpty.length) / values.length : 1,
    distinctCount: distinct.size,
    distinctRatio: nonEmpty.length ? distinct.size / nonEmpty.length : 0,
    duplicateCount,
    sampleValues: [...distinct].slice(0, 5),
    detectedFormat: detectFormat(nonEmpty),
    pii: classifyPii(field, nonEmpty),
    isLikelyIdentifier: nonEmpty.length > 0 && distinct.size === nonEmpty.length,
  };
  if (numeric.length) {
    stats.min = Math.min(...numeric);
    stats.max = Math.max(...numeric);
  }
  return stats;
}

/** Profile a sample of records (array of row objects). */
export function profileSample(records: Record<string, unknown>[]): FieldStats[] {
  if (records.length === 0) return [];
  const fields = new Set<string>();
  for (const r of records) Object.keys(r).forEach((k) => fields.add(k));
  return [...fields].map((f) => profileField(f, records.map((r) => r[f])));
}
