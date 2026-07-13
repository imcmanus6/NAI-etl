/**
 * @etl/transformation-engine — Deliverable 8: the transformation config format.
 *
 * Transformations are declarative and deterministic. Each has a `kind` and a
 * typed `params` bag. The UI renders a plain-English explanation for every one;
 * users never have to write code. Where useful the engine can compile these to
 * SQL/an internal expression, but the config is the source of truth.
 */

export type TransformationKind =
  | 'rename'
  | 'trim'
  | 'uppercase'
  | 'lowercase'
  | 'replace'
  | 'concatenate'
  | 'split'
  | 'substring'
  | 'parse_date'
  | 'format_date'
  | 'to_number'
  | 'to_boolean'
  | 'default_value'
  | 'conditional_value'
  | 'lookup_translation'
  | 'null_handling'
  | 'regex_extract'
  | 'arithmetic'
  | 'currency_config'
  | 'deduplicate'
  | 'aggregate'
  | 'reference_lookup'
  | 'multi_table_join'
  | 'source_priority';

/** Discriminated union of transformation steps. */
export type TransformationStep =
  | { kind: 'rename'; params: { to: string } }
  | { kind: 'trim'; params?: { chars?: string } }
  | { kind: 'uppercase'; params?: Record<string, never> }
  | { kind: 'lowercase'; params?: Record<string, never> }
  | { kind: 'replace'; params: { find: string; replace: string; regex?: boolean } }
  | { kind: 'concatenate'; params: { separator?: string } }
  | { kind: 'split'; params: { separator: string; limit?: number } }
  | { kind: 'substring'; params: { start: number; length?: number } }
  | { kind: 'parse_date'; params: { formats: string[]; timezone?: string } }
  | { kind: 'format_date'; params: { format: string; timezone?: string } }
  | { kind: 'to_number'; params?: { decimalSeparator?: string; thousandsSeparator?: string } }
  | { kind: 'to_boolean'; params: { trueValues: string[]; falseValues: string[] } }
  | { kind: 'default_value'; params: { value: unknown; whenNullOrEmpty?: boolean } }
  | {
      kind: 'conditional_value';
      params: { cases: Array<{ when: Condition; then: unknown }>; else?: unknown };
    }
  | { kind: 'lookup_translation'; params: { lookupTableId: string; onMiss?: 'null' | 'passthrough' | 'reject' } }
  | { kind: 'null_handling'; params: { strategy: 'to_null' | 'to_default' | 'reject'; emptyStrings?: boolean; default?: unknown } }
  | { kind: 'regex_extract'; params: { pattern: string; group?: number } }
  | { kind: 'arithmetic'; params: { op: '+' | '-' | '*' | '/'; operand: number } }
  | { kind: 'currency_config'; params: { fromCurrency: string; toCurrency: string; rateSource: string } }
  | { kind: 'deduplicate'; params: { keyFields: string[]; keep: 'first' | 'last' } }
  | { kind: 'aggregate'; params: { groupBy: string[]; fn: 'sum' | 'count' | 'min' | 'max' | 'avg'; field: string } }
  | { kind: 'reference_lookup'; params: { referenceSetId: string; keyField: string; returnField: string } }
  | { kind: 'multi_table_join'; params: { joinEntity: string; on: Array<{ left: string; right: string }>; select: string[] } }
  | { kind: 'source_priority'; params: { order: string[] } };

export type Condition =
  | { op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'; value: unknown }
  | { op: 'in' | 'not_in'; values: unknown[] }
  | { op: 'is_null' | 'is_not_null' | 'is_empty' | 'is_not_empty' }
  | { op: 'matches'; pattern: string };

/**
 * A named, ordered pipeline of steps applied to a single mapped value (or a
 * composite input array). Row/table-level steps (dedup, aggregate, join) run in
 * the batch stage rather than per-value.
 */
export interface TransformationConfig {
  id: string;
  /** Ordered steps applied left-to-right. */
  steps: TransformationStep[];
  /** Human-readable explanation surfaced in the UI. */
  explanation?: string;
}
