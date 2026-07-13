/**
 * @etl/schema-model — Deliverable 6: the canonical schema representation.
 *
 * Every intake method (DB introspection, DDL upload, data dictionary, sample
 * inference, manual definition, OpenAPI) is normalised into this single model
 * so that mapping, transformation and validation work against one shape,
 * independent of the source connector.
 */
import type { Certainty, Evidence, SchemaIntakeMethod } from '@etl/shared-types';

// --- Canonical data types ---------------------------------------------------

/** Provider-agnostic logical types. `nativeType` preserves the original. */
export type CanonicalType =
  | 'string'
  | 'text'
  | 'integer'
  | 'decimal'
  | 'float'
  | 'boolean'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamptz'
  | 'uuid'
  | 'json'
  | 'binary'
  | 'enum'
  | 'array'
  | 'unknown';

export type EntityKind = 'table' | 'view' | 'file' | 'endpoint' | 'object';

/** Semantic classification, often AI-assisted (advisory unless confirmed). */
export type EntityClassification =
  | 'core'
  | 'transaction'
  | 'lookup'
  | 'audit'
  | 'config'
  | 'archive'
  | 'junction'
  | 'unknown';

// --- Field-level annotations (profiling + AI + PII) -------------------------

export type PiiCategory =
  | 'none'
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'national_id'
  | 'financial'
  | 'dob'
  | 'other_sensitive';

export interface FieldAnnotations {
  /** Human/AI-inferred meaning, e.g. "customer's given name". */
  inferredMeaning?: string;
  meaningCertainty?: Certainty;
  detectedFormat?: string; // e.g. "ISO-8601 date", "GBP currency", "E.164 phone"
  pii?: PiiCategory;
  isLikelyIdentifier?: boolean;
  isLikelyAuditField?: boolean;
  isLikelyLookupKey?: boolean;
  enumValues?: string[];
  evidence?: Evidence[];
}

// --- Profiling statistics ---------------------------------------------------

export interface FieldProfile {
  nullRate?: number; // 0..1
  distinctCount?: number;
  distinctRatio?: number; // distinct / total
  min?: string | number;
  max?: string | number;
  sampleValues?: unknown[];
  duplicateCount?: number;
  malformedCount?: number;
}

// --- Field -----------------------------------------------------------------

export interface Field {
  id: string;
  name: string;
  ordinal: number;
  dataType: CanonicalType;
  /** Original DB/file/API type string, e.g. "varchar(255)", "NUMBER(10,2)". */
  nativeType?: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string | null;
  length?: number;
  precision?: number;
  scale?: number;
  description?: string;
  annotations?: FieldAnnotations;
  profile?: FieldProfile;
}

// --- Relationships ----------------------------------------------------------

export type RelationshipCardinality = 'one_to_one' | 'one_to_many' | 'many_to_many';

/** A relationship may be formally declared (FK) or inferred by heuristics/AI. */
export interface Relationship {
  id: string;
  name?: string;
  fromEntityId: string;
  fromFields: string[];
  toEntityId: string;
  toFields: string[];
  cardinality: RelationshipCardinality;
  declared: boolean; // true = real FK constraint; false = inferred
  certainty: Certainty;
  evidence?: Evidence[];
}

// --- Entity ----------------------------------------------------------------

export interface Entity {
  id: string;
  name: string;
  namespace?: string; // database/schema/folder
  kind: EntityKind;
  classification?: EntityClassification;
  description?: string;
  fields: Field[];
  primaryKey?: string[];
  estimatedRowCount?: number;
  /** AI-inferred purpose; advisory. */
  inferredPurpose?: string;
  purposeCertainty?: Certainty;
  evidence?: Evidence[];
}

// --- Canonical schema (the root) -------------------------------------------

export interface CanonicalSchema {
  id: string;
  name: string;
  intakeMethod: SchemaIntakeMethod;
  entities: Entity[];
  relationships: Relationship[];
  /** Freeform provenance: source file name, connection id, tool versions. */
  provenance?: Record<string, unknown>;
  createdAt: string; // ISO-8601
}

/**
 * An immutable snapshot referenced by a ProjectVersion and by every run for
 * drift detection. The bytes live in object storage; this is the metadata head.
 */
export interface SchemaSnapshot {
  id: string;
  schemaModelId: string;
  /** Content hash of the canonical schema JSON for cheap equality/diff. */
  checksum: string;
  storageKey: string; // object-store key of the full snapshot
  createdAt: string;
}

// --- Helpers ---------------------------------------------------------------

export const findEntity = (schema: CanonicalSchema, entityId: string): Entity | undefined =>
  schema.entities.find((e) => e.id === entityId);

export const findField = (entity: Entity, fieldId: string): Field | undefined =>
  entity.fields.find((f) => f.id === fieldId);

/** Convenience: every field that carries any PII classification. */
export const piiFields = (entity: Entity): Field[] =>
  entity.fields.filter((f) => f.annotations?.pii && f.annotations.pii !== 'none');
