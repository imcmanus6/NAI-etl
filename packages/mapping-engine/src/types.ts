/**
 * @etl/mapping-engine — Deliverable 7: the mapping configuration format.
 *
 * A FieldMapping is DETERMINISTIC configuration. The AI may propose mappings
 * (see MappingSuggestion), but only human-approved mappings become executable.
 */
import type { Certainty, Evidence } from '@etl/shared-types';
import type { TransformationConfig } from '@etl/transformation-engine';

export type MappingType =
  | 'exact' // 1:1, no transform
  | 'likely' // 1:1, needs review
  | 'composite' // many source -> one target (e.g. concat)
  | 'split' // one source -> many target
  | 'lookup' // via a translation/reference table
  | 'conditional' // depends on other field values
  | 'derived' // computed/constant
  | 'unmapped'; // intentionally not mapped

/** A reference to a field within a named entity of a schema. */
export interface FieldRef {
  entity: string;
  field: string;
}

/**
 * The executable mapping. `sources` is a list to support composite/split.
 * `transformation` (optional) is applied deterministically at execution.
 */
export interface FieldMapping {
  id: string;
  type: MappingType;
  /** Source fields feeding this mapping (0 for `derived`, >1 for `composite`). */
  sources: FieldRef[];
  /** Target field(s). >1 only for `split`. */
  targets: FieldRef[];
  transformation?: TransformationConfig;
  /** For `lookup`: which reference-data set to translate through. */
  lookupTableId?: string;
  /** For `derived`: a constant or expression evaluated by the transform engine. */
  derivedExpression?: string;
  /** Flag mappings that could overwrite/destroy destination data. */
  potentiallyDestructive: boolean;
  /** Provenance: did this originate from an AI suggestion? */
  originSuggestionId?: string;
  notes?: string;
}

/** The full mapping set for a project version (deterministic, versioned). */
export interface MappingSet {
  projectVersionId: string;
  sourceSchemaId: string;
  targetSchemaId: string;
  mappings: FieldMapping[];
  /** Target fields that are required but currently unmapped. */
  missingRequiredTargets: FieldRef[];
  /** Source fields not mapped anywhere (informational). */
  unmappedSources: FieldRef[];
}

// --- AI suggestion shape (advisory, pre-approval) ---------------------------

export interface MappingSuggestion {
  id: string;
  sourceField: FieldRef | null;
  targetField: FieldRef;
  mappingType: MappingType;
  confidence: number; // 0..1
  reasoning: string;
  evidence: Evidence[];
  suggestedTransformation?: TransformationConfig;
  risks: string[];
  requiresHumanConfirmation: boolean;
  certainty: Certainty;
  status: 'proposed' | 'accepted' | 'rejected' | 'modified';
}
