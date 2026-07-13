/**
 * Deterministic transformation suggester (Phase 5).
 *
 * Looks at accepted mapping suggestions and proposes the transformation needed
 * to make the source value fit the target — type conversions, date parsing,
 * lookup translation, null handling. Advisory drafts; a human accepts them.
 */
import type { TransformationStep } from '@etl/transformation-engine';

export interface MappingRiskInput {
  targetField: string; // entity.field
  sourceField: string | null;
  mappingType: string;
  risks: string[];
}

export interface TransformationSuggestion {
  targetField: string;
  steps: TransformationStep[];
  explanation: string;
  rationale: string;
}

export function suggestTransformations(mappings: MappingRiskInput[]): TransformationSuggestion[] {
  const out: TransformationSuggestion[] = [];

  for (const m of mappings) {
    const steps: TransformationStep[] = [];
    const reasons: string[] = [];
    const risksText = m.risks.join(' ').toLowerCase();

    if (/→ (integer|decimal|float)/.test(risksText)) {
      steps.push({ kind: 'to_number', params: {} });
      reasons.push('convert text to a number');
    }
    if (/→ (date|datetime|timestamptz|time)/.test(risksText)) {
      steps.push({ kind: 'parse_date', params: { formats: ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'] } });
      reasons.push('parse the value into a date');
    }
    if (m.mappingType === 'lookup') {
      steps.push({ kind: 'lookup_translation', params: { lookupTableId: `${m.targetField}-lookup`, onMiss: 'reject' } });
      reasons.push('translate a coded value through a lookup table');
    }
    if (/nullable but target is required/.test(risksText)) {
      steps.push({ kind: 'null_handling', params: { strategy: 'reject', emptyStrings: true } });
      reasons.push('reject rows where a required value is missing');
    }

    if (steps.length) {
      out.push({
        targetField: m.targetField,
        steps,
        explanation: `Apply: ${reasons.join(', then ')}.`,
        rationale: `Derived from mapping risks: ${m.risks.join('; ')}`,
      });
    }
  }

  return out;
}
