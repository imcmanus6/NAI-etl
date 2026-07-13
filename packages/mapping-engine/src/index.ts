/**
 * @etl/mapping-engine
 *
 * Deterministic application of an approved MappingSet to a source record,
 * producing a target-shaped record. Transformations are delegated to
 * @etl/transformation-engine. No AI, no I/O — safe to run per-record in workers.
 */
import { applyTransformation, type TransformContext } from '@etl/transformation-engine';
import type { FieldMapping, MappingSet } from './types.js';

export * from './types.js';

export interface ApplyMappingResult {
  /** The assembled target record, keyed by "entity.field". */
  target: Record<string, unknown>;
  warnings: string[];
}

const key = (entity: string, field: string) => `${entity}.${field}`;

/** Reads a source field value using a "entity.field" flat key. */
const readSource = (record: Record<string, unknown>, entity: string, field: string): unknown =>
  record[key(entity, field)] ?? record[field];

/**
 * Apply a single mapping to a source record. Lookups are resolved via the
 * caller-supplied resolver in the TransformContext (deterministic reference
 * data), keeping this function pure.
 */
export function applyFieldMapping(
  mapping: FieldMapping,
  source: Record<string, unknown>,
  ctx: TransformContext,
): { values: Array<{ ref: string; value: unknown }>; warnings: string[] } {
  const warnings: string[] = [];

  if (mapping.type === 'unmapped') {
    return { values: [], warnings };
  }

  // Gather source inputs (0..n).
  const inputs = mapping.sources.map((s) => readSource(source, s.entity, s.field));

  // Derive the base value.
  let value: unknown;
  if (mapping.type === 'derived') {
    value = mapping.derivedExpression ?? null;
  } else if (inputs.length <= 1) {
    value = inputs[0] ?? null;
  } else {
    value = inputs; // composite: transform decides how to combine
  }

  // Apply the optional deterministic transformation.
  if (mapping.transformation) {
    const result = applyTransformation(mapping.transformation, value, ctx);
    value = result.value;
    warnings.push(...result.warnings);
  }

  // Split vs single-target assignment.
  if (mapping.type === 'split' && Array.isArray(value)) {
    return {
      values: mapping.targets.map((t, i) => ({
        ref: key(t.entity, t.field),
        value: (value as unknown[])[i] ?? null,
      })),
      warnings,
    };
  }

  return {
    values: mapping.targets.map((t) => ({ ref: key(t.entity, t.field), value })),
    warnings,
  };
}

/** Apply an entire mapping set to one source record. */
export function applyMappingSet(
  set: MappingSet,
  source: Record<string, unknown>,
  ctx: TransformContext,
): ApplyMappingResult {
  const target: Record<string, unknown> = {};
  const warnings: string[] = [];

  for (const mapping of set.mappings) {
    const { values, warnings: w } = applyFieldMapping(mapping, source, ctx);
    for (const { ref, value } of values) target[ref] = value;
    warnings.push(...w);
  }

  return { target, warnings };
}
