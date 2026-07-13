/**
 * Deterministic mapping-suggestion engine (Phase 4).
 *
 * Produces source→target field-mapping suggestions from names, types, keys and
 * profiling — each with a confidence score, reasoning, evidence and risks. This
 * is the offline backbone; when an LLM is configured it refines these (see
 * MappingsService). Pure and testable — no I/O.
 */
import type { CanonicalSchema, CanonicalType, Entity, Field } from '@etl/schema-model';
import type { Certainty, Evidence } from '@etl/shared-types';

export interface Suggestion {
  sourceField: string | null; // "entity.field"
  targetField: string; // "entity.field"
  mappingType: 'exact' | 'likely' | 'lookup' | 'derived' | 'unmapped';
  confidence: number;
  reasoning: string;
  evidence: Evidence[];
  risks: string[];
  requiresHumanConfirmation: boolean;
  certainty: Certainty;
}

export interface SuggestionResult {
  suggestions: Suggestion[];
  unmappedSources: string[];
  missingRequiredTargets: string[];
}

// Common abbreviation / synonym expansion (token -> canonical tokens).
const SYNONYMS: Record<string, string[]> = {
  acct: ['account'],
  acc: ['account'],
  no: ['number'],
  num: ['number'],
  nbr: ['number'],
  bal: ['balance'],
  amt: ['amount'],
  qty: ['quantity'],
  dob: ['date', 'of', 'birth'],
  dt: ['date'],
  ts: ['timestamp'],
  cd: ['code'],
  desc: ['description'],
  fname: ['first', 'name'],
  lname: ['last', 'name'],
  first: ['given'],
  forename: ['given'],
  last: ['family', 'surname'],
  surname: ['family'],
  tel: ['phone'],
  mobile: ['phone'],
  addr: ['address'],
  cust: ['customer'],
  org: ['organisation'],
  ref: ['reference'],
  id: ['identifier'],
  pmt: ['payment'],
  txn: ['transaction'],
};

const NUMERIC: CanonicalType[] = ['integer', 'decimal', 'float'];
const TEMPORAL: CanonicalType[] = ['date', 'datetime', 'time', 'timestamptz'];
const TEXTUAL: CanonicalType[] = ['string', 'text', 'uuid', 'enum'];

function typeGroup(t: CanonicalType): string {
  if (NUMERIC.includes(t)) return 'numeric';
  if (TEMPORAL.includes(t)) return 'temporal';
  if (TEXTUAL.includes(t)) return 'text';
  if (t === 'boolean') return 'boolean';
  return t;
}

function tokenize(name: string): string[] {
  const raw = name
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const expanded: string[] = [];
  for (const tok of raw) expanded.push(...(SYNONYMS[tok] ?? [tok]));
  return expanded;
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

interface Candidate {
  source: { entity: Entity; field: Field };
  score: number;
  reasons: string[];
  evidence: Evidence[];
  risks: string[];
}

function scoreCandidate(
  target: { entity: Entity; field: Field },
  source: { entity: Entity; field: Field },
): Candidate {
  const tTokens = tokenize(target.field.name);
  const sTokens = tokenize(source.field.name);
  const reasons: string[] = [];
  const evidence: Evidence[] = [];
  const risks: string[] = [];

  let score = 0;
  if (source.field.name.toLowerCase() === target.field.name.toLowerCase()) {
    score = 1;
    reasons.push('exact name match');
  } else {
    const overlap = jaccard(tTokens, sTokens);
    score = overlap * 0.9;
    if (overlap >= 0.99) reasons.push('normalised name match');
    else if (overlap > 0) reasons.push(`token overlap ${(overlap * 100).toFixed(0)}%`);
  }
  evidence.push({ kind: 'column_name', detail: `${source.entity.name}.${source.field.name} ~ ${target.entity.name}.${target.field.name}` });

  // Type compatibility.
  const sg = typeGroup(source.field.dataType);
  const tg = typeGroup(target.field.dataType);
  if (sg === tg) {
    score += 0.05;
  } else {
    score -= 0.1;
    risks.push(`type conversion ${source.field.dataType} → ${target.field.dataType} required`);
  }

  // Nullability risk.
  if (source.field.nullable && !target.field.nullable && !target.field.isPrimaryKey) {
    risks.push('source is nullable but target is required');
  }

  // Sample-value evidence.
  const samples = source.field.profile?.sampleValues;
  if (samples?.length) {
    evidence.push({ kind: 'example_value', detail: `e.g. ${samples.slice(0, 3).map(String).join(', ')}` });
  }

  return { source, score: Math.max(0, Math.min(1, score)), reasons, evidence, risks };
}

function isLookupCode(field: Field): boolean {
  return /(_cd|_code|status|type)$/.test(field.name.toLowerCase()) || (field.annotations?.enumValues?.length ?? 0) > 0;
}

export function suggestMappings(source: CanonicalSchema, target: CanonicalSchema): SuggestionResult {
  const sourceFields = source.entities.flatMap((entity) => entity.fields.map((field) => ({ entity, field })));
  const suggestions: Suggestion[] = [];
  const usedSources = new Set<string>();
  const missingRequiredTargets: string[] = [];

  for (const entity of target.entities) {
    for (const field of entity.fields) {
      const targetRef = `${entity.name}.${field.name}`;
      const candidates = sourceFields
        .map((s) => scoreCandidate({ entity, field }, s))
        .sort((a, b) => b.score - a.score);
      const best = candidates[0];

      if (!best || best.score < 0.35) {
        if (!field.nullable && !field.isPrimaryKey) missingRequiredTargets.push(targetRef);
        continue;
      }

      const sourceRef = `${best.source.entity.name}.${best.source.field.name}`;
      usedSources.add(sourceRef);

      const lookup = isLookupCode(best.source.field) && (isLookupCode(field) || best.score < 0.7);
      const mappingType = best.score >= 0.98 && best.risks.length === 0 ? 'exact' : lookup ? 'lookup' : 'likely';
      if (lookup) best.risks.push('coded value — map through a translation/lookup table');

      const confidence = Number(best.score.toFixed(2));
      const certainty: Certainty =
        confidence >= 0.95 && best.risks.length === 0
          ? 'strong_inference'
          : confidence >= 0.6
            ? 'weak_assumption'
            : 'needs_confirmation';

      suggestions.push({
        sourceField: sourceRef,
        targetField: targetRef,
        mappingType,
        confidence,
        reasoning: best.reasons.join('; ') || 'best available candidate by name/type similarity',
        evidence: best.evidence,
        risks: best.risks,
        requiresHumanConfirmation: confidence < 0.9 || best.risks.length > 0 || mappingType === 'lookup',
        certainty,
      });
    }
  }

  const unmappedSources = sourceFields
    .map((s) => `${s.entity.name}.${s.field.name}`)
    .filter((ref) => !usedSources.has(ref));

  return { suggestions, unmappedSources, missingRequiredTargets };
}
