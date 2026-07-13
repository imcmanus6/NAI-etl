/**
 * @etl/validation-engine — Deliverable 9: the validation configuration format.
 *
 * Validation rules are declarative and deterministic. They run at several
 * levels; record/field-level rules run per-record in workers, while
 * cross-table/batch/destination rules run in the DuckDB batch stage.
 */
import type { Certainty } from '@etl/shared-types';

export type ValidationLevel =
  | 'file'
  | 'schema'
  | 'record'
  | 'field'
  | 'cross_field'
  | 'cross_table'
  | 'batch'
  | 'destination';

export type ValidationRuleType =
  | 'required'
  | 'valid_date'
  | 'allowed_value'
  | 'min_length'
  | 'max_length'
  | 'numeric_range'
  | 'valid_email'
  | 'valid_postcode'
  | 'valid_currency_code'
  | 'unique_identifier'
  | 'referential_integrity'
  | 'balance_reconciliation'
  | 'sum_equals'
  | 'child_requires_parent'
  | 'duplicate_source'
  | 'duplicate_destination'
  | 'regex_match'
  | 'cross_field_compare';

/** What happens when a rule fails. */
export type ValidationSeverity = 'reject' | 'warn';

export interface ValidationRule {
  id: string;
  level: ValidationLevel;
  ruleType: ValidationRuleType;
  /** Field(s) the rule targets (entity.field form). */
  fields: string[];
  params: Record<string, unknown>;
  severity: ValidationSeverity;
  /** Human-readable message template, e.g. "{field} must be a valid email". */
  message?: string;
  /** Provenance if AI-suggested. */
  originSuggestionId?: string;
}

export interface ValidationSet {
  projectVersionId: string;
  rules: ValidationRule[];
}

// --- Results ----------------------------------------------------------------

export interface ValidationFailure {
  ruleId: string;
  ruleType: ValidationRuleType;
  level: ValidationLevel;
  field?: string;
  severity: ValidationSeverity;
  message: string;
  value?: unknown;
}

export interface RecordValidationResult {
  recordKey: string;
  passed: boolean; // false if any `reject`-severity rule failed
  failures: ValidationFailure[];
}

// --- AI suggestion shape ----------------------------------------------------

export interface ValidationSuggestion {
  id: string;
  level: ValidationLevel;
  ruleType: ValidationRuleType;
  fields: string[];
  params: Record<string, unknown>;
  severity: ValidationSeverity;
  rationale: string;
  certainty: Certainty;
  status: 'proposed' | 'accepted' | 'rejected' | 'modified';
}
