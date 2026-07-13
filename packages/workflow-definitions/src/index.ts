/**
 * @etl/workflow-definitions — Deliverable 10: Temporal workflow & activity
 * contracts.
 *
 * This package holds only TYPES and constants shared between the API (which
 * starts/queries workflows) and the worker (which implements them). The actual
 * workflow/activity implementations live in apps/worker so this package stays
 * free of the Temporal runtime and safe to import anywhere.
 *
 * See docs/WORKFLOWS.md for the narrative outline and state machine.
 */
import type { LineageContext, RunMetrics, RunStageName } from '@etl/shared-types';

// --- Task queues ------------------------------------------------------------

export const TASK_QUEUES = {
  main: 'etl-main',
  extraction: 'extraction',
  schemaDiscovery: 'schema-discovery',
  profiling: 'profiling',
  aiMapping: 'ai-mapping',
  transformation: 'transformation',
  validation: 'validation',
  loading: 'loading',
  reconciliation: 'reconciliation',
  fileGeneration: 'file-generation',
  delivery: 'delivery',
  notifications: 'notifications',
} as const;

export type TaskQueue = (typeof TASK_QUEUES)[keyof typeof TASK_QUEUES];

// --- Workflow inputs --------------------------------------------------------

export interface SchemaIntakeInput {
  lineage: LineageContext;
  connectionId?: string;
  /** For file/DDL/dictionary intake: object-store key of the uploaded file. */
  uploadKey?: string;
  intakeMethod:
    | 'db_introspection'
    | 'ddl_upload'
    | 'data_dictionary'
    | 'sample_inference'
    | 'manual'
    | 'openapi';
}

export interface SourceUnderstandingInput {
  lineage: LineageContext;
  schemaModelId: string;
}

export interface MappingInput {
  lineage: LineageContext;
  sourceSchemaId: string;
  targetSchemaId: string;
}

export interface TestRunInput {
  lineage: LineageContext;
  projectVersionId: string;
  sampleLimit: number;
}

export interface MigrationInput {
  lineage: LineageContext;
  migrationPlanId: string;
  wave: number;
  mode: 'trial' | 'delta' | 'final';
}

export interface ProductionRunInput {
  lineage: LineageContext;
}

// --- Workflow query/signal payloads ----------------------------------------

export interface RunProgress {
  stage: RunStageName;
  pctComplete: number;
  metrics: RunMetrics;
  message?: string;
}

export interface MappingReviewSignal {
  acceptedSuggestionIds: string[];
  rejectedSuggestionIds: string[];
  editedMappings: unknown[]; // FieldMapping[] from @etl/mapping-engine (kept loose to avoid a cycle)
}

export interface ApprovalSignal {
  decision: 'approved' | 'changes_requested';
  approverId: string;
  notes?: string;
}

// --- Signal/query names (shared string constants) --------------------------

export const SIGNALS = {
  cancel: 'cancel',
  submitMappingReview: 'submitMappingReview',
  submitApproval: 'submitApproval',
} as const;

export const QUERIES = {
  getStatus: 'getStatus',
  getRunProgress: 'getRunProgress',
  getMappingProgress: 'getMappingProgress',
} as const;

// --- Activity interface contracts ------------------------------------------

/**
 * The activity surface the worker must implement. Grouped by stage. All are
 * idempotent (keyed by lineage.runId + stage + batch) and receive/log the
 * lineage tuple. Signatures are intentionally coarse; concrete DTOs are in the
 * engine packages.
 */
export interface EtlActivities {
  // extraction
  testConnection(input: { lineage: LineageContext; connectionId: string }): Promise<{ ok: boolean; message: string }>;
  extractSample(input: TestRunInput & { entity: string }): Promise<{ storageKey: string; count: number }>;

  // schema discovery
  discoverSchema(input: SchemaIntakeInput): Promise<{ schemaModelId: string; entities: number }>;
  parseSchemaFile(input: SchemaIntakeInput): Promise<{ schemaModelId: string; entities: number }>;
  inferSchemaFromSample(input: SchemaIntakeInput): Promise<{ schemaModelId: string; entities: number }>;
  snapshotSchema(input: { lineage: LineageContext; schemaModelId: string }): Promise<{ snapshotId: string; checksum: string }>;
  assertSchemaCompatible(input: { lineage: LineageContext; snapshotId: string }): Promise<{ compatible: boolean; drift?: string }>;

  // profiling
  profileData(input: { lineage: LineageContext; schemaModelId: string }): Promise<{ profiledEntities: number }>;

  // ai (advisory, draft-only)
  generateSourceOverview(input: SourceUnderstandingInput): Promise<{ overviewId: string }>;
  proposeFieldMappings(input: MappingInput): Promise<{ suggestionCount: number }>;
  explainFailures(input: { lineage: LineageContext; runId: string }): Promise<{ explanationId: string }>;
  sequenceEntities(input: { lineage: LineageContext; migrationPlanId: string }): Promise<{ suggestedOrder: string[] }>;

  // transformation / validation / loading (deterministic)
  applyTransformations(input: TestRunInput & { inputKey: string }): Promise<{ outputKey: string; warnings: number }>;
  runValidations(input: TestRunInput & { inputKey: string }): Promise<{ accepted: number; rejected: number; rejectKey: string }>;
  loadToTarget(input: TestRunInput & { inputKey: string; sandbox: boolean }): Promise<{ created: number; updated: number; skipped: number }>;

  // reconciliation / delivery / notifications
  reconcile(input: TestRunInput): Promise<{ passed: boolean; report: Record<string, unknown> }>;
  deliver(input: ProductionRunInput & { outputKey: string }): Promise<{ delivered: boolean }>;
  notify(input: { lineage: LineageContext; event: string; detail?: Record<string, unknown> }): Promise<void>;

  // persistence helpers
  updateRunMetrics(input: { lineage: LineageContext; metrics: Partial<RunMetrics>; stage: RunStageName }): Promise<void>;
}

/** Workflow names (used by the API to start/query by name). */
export const WORKFLOWS = {
  schemaIntake: 'schemaIntakeWorkflow',
  sourceUnderstanding: 'sourceUnderstandingWorkflow',
  mapping: 'mappingWorkflow',
  testRun: 'testRunWorkflow',
  migration: 'migrationWorkflow',
  productionRun: 'productionRunWorkflow',
} as const;
