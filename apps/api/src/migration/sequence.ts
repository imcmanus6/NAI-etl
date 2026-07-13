/**
 * Deterministic migration entity sequencing (Phase 6).
 *
 * Uses foreign-key / inferred relationships to order entities so a parent is
 * always migrated before its children (topological order). Cycles are broken
 * deterministically and reported. The AI can propose an order too, but this
 * dependency-driven order is the reproducible backbone.
 */
import type { CanonicalSchema } from '@etl/schema-model';

export interface SequencedEntity {
  entity: string;
  order: number;
  wave: number;
  dependsOn: string[];
  reason: string;
}

export interface SequenceResult {
  sequence: SequencedEntity[];
  cyclesBrokenBetween: Array<[string, string]>;
}

export function sequenceEntities(schema: CanonicalSchema): SequenceResult {
  const names = schema.entities.map((e) => e.name);
  // dependsOn: child -> [parents]. A FK from child.fromEntity to parent.toEntity.
  const deps = new Map<string, Set<string>>();
  for (const n of names) deps.set(n, new Set());
  for (const rel of schema.relationships) {
    if (rel.fromEntityId === rel.toEntityId) continue; // ignore self-refs for ordering
    if (deps.has(rel.fromEntityId) && names.includes(rel.toEntityId)) {
      deps.get(rel.fromEntityId)!.add(rel.toEntityId);
    }
  }

  const cyclesBrokenBetween: Array<[string, string]> = [];
  const visited = new Set<string>();
  const inProgress = new Set<string>();
  const ordered: string[] = [];

  const visit = (node: string, stack: string[]) => {
    if (visited.has(node)) return;
    if (inProgress.has(node)) {
      // Cycle: break the edge back to the node already in progress.
      const parent = stack[stack.length - 1];
      if (parent) cyclesBrokenBetween.push([parent, node]);
      return;
    }
    inProgress.add(node);
    for (const parent of deps.get(node) ?? []) visit(parent, [...stack, node]);
    inProgress.delete(node);
    visited.add(node);
    ordered.push(node);
  };

  for (const n of names) visit(n, []);

  // Assign waves: a node's wave = 1 + max(parent waves).
  const waveOf = new Map<string, number>();
  for (const n of ordered) {
    const parents = [...(deps.get(n) ?? [])];
    const wave = parents.length ? Math.max(...parents.map((p) => waveOf.get(p) ?? 1)) + 1 : 1;
    waveOf.set(n, wave);
  }

  const sequence: SequencedEntity[] = ordered.map((entity, i) => {
    const dependsOn = [...(deps.get(entity) ?? [])];
    return {
      entity,
      order: i + 1,
      wave: waveOf.get(entity) ?? 1,
      dependsOn,
      reason: dependsOn.length
        ? `Depends on ${dependsOn.join(', ')} — must be loaded after them`
        : 'No dependencies — can be loaded first',
    };
  });

  return { sequence, cyclesBrokenBetween };
}
