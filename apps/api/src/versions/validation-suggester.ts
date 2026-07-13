/**
 * Deterministic validation-rule suggester (Phase 5).
 *
 * Proposes validation rules from target constraints, field types and profiling.
 * Advisory drafts — a human accepts them into the deterministic validation set.
 */
import type { CanonicalSchema } from '@etl/schema-model';
import type { Certainty } from '@etl/shared-types';

export interface ValidationSuggestion {
  level: 'field' | 'record' | 'cross_table';
  ruleType: string;
  fields: string[]; // entity.field
  params: Record<string, unknown>;
  severity: 'reject' | 'warn';
  rationale: string;
  certainty: Certainty;
}

const NUMERIC = ['integer', 'decimal', 'float'];
const TEMPORAL = ['date', 'datetime', 'time', 'timestamptz'];

export function suggestValidations(target: CanonicalSchema): ValidationSuggestion[] {
  const out: ValidationSuggestion[] = [];

  for (const entity of target.entities) {
    for (const field of entity.fields) {
      const ref = `${entity.name}.${field.name}`;
      const name = field.name.toLowerCase();

      if (!field.nullable && !field.isPrimaryKey) {
        out.push({
          level: 'field',
          ruleType: 'required',
          fields: [ref],
          params: {},
          severity: 'reject',
          rationale: `Target column ${ref} is NOT NULL`,
          certainty: 'confirmed',
        });
      }

      if (field.isPrimaryKey || field.annotations?.isLikelyIdentifier) {
        out.push({
          level: 'record',
          ruleType: 'unique_identifier',
          fields: [ref],
          params: {},
          severity: 'reject',
          rationale: field.isPrimaryKey ? `${ref} is the primary key` : `${ref} looks like a unique identifier`,
          certainty: field.isPrimaryKey ? 'confirmed' : 'weak_assumption',
        });
      }

      if (name.includes('email') || field.annotations?.detectedFormat === 'email') {
        out.push({
          level: 'field',
          ruleType: 'valid_email',
          fields: [ref],
          params: {},
          severity: 'warn',
          rationale: `${ref} appears to hold email addresses`,
          certainty: 'strong_inference',
        });
      }

      if (field.annotations?.enumValues?.length) {
        out.push({
          level: 'field',
          ruleType: 'allowed_value',
          fields: [ref],
          params: { values: field.annotations.enumValues },
          severity: 'reject',
          rationale: `${ref} is constrained to a known set of values`,
          certainty: 'confirmed',
        });
      }

      if (NUMERIC.includes(field.dataType) && field.profile?.min != null && field.profile?.max != null) {
        out.push({
          level: 'field',
          ruleType: 'numeric_range',
          fields: [ref],
          params: { min: field.profile.min, max: field.profile.max },
          severity: 'warn',
          rationale: `Observed range for ${ref} was ${field.profile.min}–${field.profile.max}`,
          certainty: 'weak_assumption',
        });
      }

      if (TEMPORAL.includes(field.dataType)) {
        out.push({
          level: 'field',
          ruleType: 'valid_date',
          fields: [ref],
          params: {},
          severity: 'reject',
          rationale: `${ref} is a date/time column`,
          certainty: 'confirmed',
        });
      }

      if (name.includes('currency') || name.endsWith('_ccy')) {
        out.push({
          level: 'field',
          ruleType: 'valid_currency_code',
          fields: [ref],
          params: {},
          severity: 'warn',
          rationale: `${ref} looks like a currency code`,
          certainty: 'weak_assumption',
        });
      }
    }
  }

  // Referential integrity for declared foreign keys.
  for (const rel of target.relationships) {
    out.push({
      level: 'cross_table',
      ruleType: 'referential_integrity',
      fields: rel.fromFields.map((f) => `${rel.fromEntityId}.${f}`),
      params: { references: `${rel.toEntityId}.${rel.toFields.join(',')}` },
      severity: 'reject',
      rationale: `${rel.fromEntityId} references ${rel.toEntityId}`,
      certainty: rel.declared ? 'confirmed' : 'weak_assumption',
    });
  }

  return out;
}
