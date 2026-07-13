/**
 * Deterministic error explanation (Phase 5).
 *
 * Turns raw validation failures into a plain-English summary: which fields cause
 * the most failures, the probable cause (source data vs mapping), and suggested
 * corrections. An LLM (when configured) can elaborate; this always works offline.
 */
import type { ValidationFailure } from '@etl/validation-engine';

export interface FailureSummary {
  totalFailures: number;
  byField: Array<{ field: string; count: number; ruleTypes: string[] }>;
  plainEnglish: string;
  probableCause: 'source' | 'mapping' | 'destination' | 'data_quality';
  suggestedActions: string[];
}

export function explainFailures(failures: ValidationFailure[]): FailureSummary {
  const byFieldMap = new Map<string, { count: number; rules: Set<string> }>();
  for (const f of failures) {
    const key = f.field ?? '(record)';
    const entry = byFieldMap.get(key) ?? { count: 0, rules: new Set<string>() };
    entry.count += 1;
    entry.rules.add(f.ruleType);
    byFieldMap.set(key, entry);
  }

  const byField = [...byFieldMap.entries()]
    .map(([field, v]) => ({ field, count: v.count, ruleTypes: [...v.rules] }))
    .sort((a, b) => b.count - a.count);

  const top = byField[0];
  const requiredHeavy = failures.filter((f) => f.ruleType === 'required').length;
  const formatHeavy = failures.filter((f) =>
    ['valid_email', 'valid_date', 'numeric_range', 'valid_currency_code'].includes(f.ruleType),
  ).length;

  let probableCause: FailureSummary['probableCause'] = 'data_quality';
  const suggestedActions: string[] = [];

  if (requiredHeavy >= formatHeavy && requiredHeavy > 0) {
    probableCause = top && top.ruleTypes.includes('required') ? 'mapping' : 'source';
    suggestedActions.push(
      `Check whether "${top?.field}" is mapped from a populated source field, or add a default-value transformation.`,
    );
  }
  if (formatHeavy > 0) {
    suggestedActions.push(
      `Add a parsing/formatting transformation for ${byField
        .filter((f) => f.ruleTypes.some((r) => r.startsWith('valid_') || r === 'numeric_range'))
        .map((f) => f.field)
        .slice(0, 3)
        .join(', ')} so values match the target format.`,
    );
  }
  if (failures.length === 0) suggestedActions.push('No failures — the sample is clean against the current rules.');

  const plainEnglish =
    failures.length === 0
      ? 'All sampled records passed validation.'
      : `${failures.length} validation failure(s) across ${byField.length} field(s). ` +
        (top ? `Most failures are on "${top.field}" (${top.count}, rules: ${top.ruleTypes.join(', ')}). ` : '') +
        (probableCause === 'mapping'
          ? 'This pattern usually points to a mapping gap (a required target is unmapped or wrongly mapped).'
          : probableCause === 'source'
            ? 'This pattern usually points to source data quality (missing/blank values at source).'
            : 'This pattern usually points to values that need a transformation to match the target format.');

  return { totalFailures: failures.length, byField, plainEnglish, probableCause, suggestedActions };
}
