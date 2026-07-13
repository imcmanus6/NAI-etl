/**
 * @etl/shared-types
 *
 * Cross-cutting types shared by the React web app, the NestJS API and the
 * Temporal workers. Keep this package dependency-free and framework-free so it
 * can be imported anywhere.
 */

// --- Branded id helpers -----------------------------------------------------

export type Uuid = string;

export type TenantId = Uuid;
export type CustomerId = Uuid;
export type EnvironmentId = Uuid;
export type ProjectId = Uuid;
export type ProjectVersionId = Uuid;
export type RunId = Uuid;
export type UserId = Uuid;
export type ConnectionId = Uuid;
export type SchemaModelId = Uuid;

/**
 * The lineage tuple every job/record carries end-to-end. Enables full
 * source-to-target traceability and tenant isolation.
 */
export interface LineageContext {
  tenantId: TenantId;
  customerId: CustomerId;
  environmentId: EnvironmentId;
  projectId: ProjectId;
  projectVersionId: ProjectVersionId | null; // null before a version is cut
  runId: RunId | null; // null outside of an execution
}

// --- Enumerations -----------------------------------------------------------

export type ProjectType = 'integration' | 'migration';

export type IntegrationType =
  | 'inbound_file_import'
  | 'outbound_file_export'
  | 'api_to_database'
  | 'database_to_api'
  | 'file_to_api'
  | 'api_to_file'
  | 'database_to_database'
  | 'scheduled_batch'
  | 'on_demand_batch'
  | 'webhook_triggered';

export type Direction = 'inbound' | 'outbound' | 'bidirectional';

export type ConnectionKind = 'source' | 'destination';

export type ConnectorType =
  | 'postgres'
  | 'mysql'
  | 'sqlserver'
  | 'rest'
  | 'lateral'
  | 'csv'
  | 'delimited'
  | 'json'
  | 'xml'
  | 'fixedwidth'
  | 'hl7'
  | 'excel'
  | 'sftp'
  | 's3';

export type SchemaIntakeMethod =
  | 'db_introspection'
  | 'ddl_upload'
  | 'data_dictionary'
  | 'sample_inference'
  | 'fixed_width'
  | 'hl7'
  | 'manual'
  | 'openapi';

/**
 * One field in a fixed-width record layout. Positions are 1-based. This is what
 * turns "write a plugin per format" into "give us the record layout" — the
 * layout is data (often inferred from documentation), not code.
 */
export interface FixedWidthField {
  name: string;
  start: number; // 1-based column position
  width: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  description?: string;
}

/** Lifecycle status of a project version. */
export type VersionStatus =
  | 'draft'
  | 'analysing'
  | 'mapping'
  | 'testing'
  | 'awaiting_approval'
  | 'approved'
  | 'deployed'
  | 'paused'
  | 'retired';

export type RunMode = 'test' | 'trial' | 'delta' | 'final' | 'production';

export type RunStatus =
  | 'queued'
  | 'running'
  | 'awaiting_input'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type RunStageName =
  | 'extraction'
  | 'schema_discovery'
  | 'profiling'
  | 'ai_mapping'
  | 'transformation'
  | 'validation'
  | 'loading'
  | 'reconciliation'
  | 'file_generation'
  | 'delivery'
  | 'notifications';

/** How confident an AI conclusion is. Guesses are never presented as facts. */
export type Certainty =
  | 'confirmed' // from schema metadata
  | 'strong_inference'
  | 'weak_assumption'
  | 'needs_confirmation';

// --- Run metrics ------------------------------------------------------------

export interface RunMetrics {
  sourceRecords: number;
  acceptedRecords: number;
  rejectedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  duplicateRecords: number;
  apiCalls: number;
  filesProcessed: number;
  warnings: number;
  errors: number;
  retryAttempts: number;
}

export const emptyRunMetrics = (): RunMetrics => ({
  sourceRecords: 0,
  acceptedRecords: 0,
  rejectedRecords: 0,
  createdRecords: 0,
  updatedRecords: 0,
  skippedRecords: 0,
  duplicateRecords: 0,
  apiCalls: 0,
  filesProcessed: 0,
  warnings: 0,
  errors: 0,
  retryAttempts: 0,
});

// --- White-label ------------------------------------------------------------

export interface ThemeTokens {
  colorPrimary: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  fontFamily: string;
  borderRadius: string;
  [token: string]: string;
}

export interface WhiteLabelConfig {
  productName: string;
  logoUrl: string | null;
  domain: string | null;
  supportEmail: string | null;
  supportUrl: string | null;
  /** Overrides for domain terminology, e.g. { "customer": "client" }. */
  terminologyOverrides: Record<string, string>;
  enabledConnectors: ConnectorType[];
  enabledModules: string[];
  theme: ThemeTokens;
}

// --- Evidence (shared by AI + persistence) ----------------------------------

export type EvidenceKind =
  | 'table_name'
  | 'column_name'
  | 'foreign_key'
  | 'example_value'
  | 'row_distribution'
  | 'documentation'
  | 'uploaded_mapping';

export interface Evidence {
  kind: EvidenceKind;
  detail: string;
  ref?: string;
}

// --- Generic API envelope ---------------------------------------------------

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
