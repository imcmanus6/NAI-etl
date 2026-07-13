/**
 * Generated documentation (Phase 6).
 *
 * Produces a mapping document as Markdown straight from the APPROVED version
 * config, so the documentation can never drift from what actually executes.
 */
interface FieldMappingLike {
  type: string;
  sources?: Array<{ entity: string; field: string }>;
  targets?: Array<{ entity: string; field: string }>;
  transformation?: { steps?: Array<{ kind: string }>; explanation?: string };
  potentiallyDestructive?: boolean;
}

interface ValidationRuleLike {
  level: string;
  ruleType: string;
  fields: string[];
  severity: string;
}

export interface DocInput {
  productName: string;
  projectName: string;
  projectType: string;
  versionNumber: number;
  status: string;
  mappings: FieldMappingLike[];
  validations: ValidationRuleLike[];
  testEvidence?: Record<string, unknown>;
  generatedAt: string;
}

const ref = (a?: Array<{ entity: string; field: string }>) =>
  (a ?? []).map((r) => `${r.entity}.${r.field}`).join(', ') || '—';

export function generateMappingDocument(input: DocInput): string {
  const lines: string[] = [];
  lines.push(`# Mapping Document — ${input.projectName}`);
  lines.push('');
  lines.push(`- **Product:** ${input.productName}`);
  lines.push(`- **Project type:** ${input.projectType}`);
  lines.push(`- **Version:** v${input.versionNumber} (${input.status})`);
  lines.push(`- **Generated:** ${input.generatedAt}`);
  lines.push('');
  lines.push(
    '> Generated from the approved configuration. It reflects exactly what the ' +
      'deterministic pipeline executes.',
  );
  lines.push('');

  lines.push('## Field mappings');
  lines.push('');
  lines.push('| Source | Target | Type | Transformation | Notes |');
  lines.push('|--------|--------|------|----------------|-------|');
  for (const m of input.mappings) {
    const transform = m.transformation?.steps?.map((s) => s.kind).join(' → ') || '—';
    const notes = m.potentiallyDestructive ? '⚠ potentially destructive' : '';
    lines.push(`| ${ref(m.sources)} | ${ref(m.targets)} | ${m.type} | ${transform} | ${notes} |`);
  }
  if (input.mappings.length === 0) lines.push('| _none_ | | | | |');
  lines.push('');

  lines.push('## Validation rules');
  lines.push('');
  lines.push('| Level | Rule | Fields | Severity |');
  lines.push('|-------|------|--------|----------|');
  for (const v of input.validations) {
    lines.push(`| ${v.level} | ${v.ruleType} | ${v.fields.join(', ')} | ${v.severity} |`);
  }
  if (input.validations.length === 0) lines.push('| _none_ | | | |');
  lines.push('');

  if (input.testEvidence && Object.keys(input.testEvidence).length) {
    lines.push('## Test evidence');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(input.testEvidence, null, 2));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}
