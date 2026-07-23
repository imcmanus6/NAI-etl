/**
 * Tiny API client for the web app. Talks to the NestJS API over REST/JSON and
 * carries the JWT from localStorage. Kept dependency-free.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('etl_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) });

// --- Auth -------------------------------------------------------------------

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string; roles: string[] };
}

export const login = (email: string, password: string, tenantSlug?: string) =>
  post<LoginResponse>('/auth/login', { email, password, tenantSlug });

export interface TenantMe {
  id: string;
  slug: string;
  name: string;
  whiteLabel: { productName?: string; theme?: Record<string, string> };
}

export const getTenant = () => api<TenantMe>('/tenants/me');

// --- Connections ------------------------------------------------------------

export interface Connection {
  id: string;
  name: string;
  kind: 'source' | 'destination';
  connectorType: string;
}

export const listConnections = () => api<Connection[]>('/connections');
export const createConnection = (body: {
  name: string;
  kind: 'source' | 'destination';
  connectorType: string;
  config: Record<string, unknown>;
  secretRef?: string;
}) => post<Connection>('/connections', body);
export const testConnection = (id: string) =>
  post<{ ok: boolean; message: string }>(`/connections/${id}/test`, {});

// --- Customers & projects ---------------------------------------------------

export interface Customer {
  id: string;
  name: string;
}
export const listCustomers = () => api<Customer[]>('/tenants/customers');

export interface Project {
  id: string;
  name: string;
  type: 'integration' | 'migration';
  product?: string | null;
  currentVersionId?: string | null;
}
export const listProjects = () => api<Project[]>('/projects');
export const getProject = (id: string) => api<Project>(`/projects/${id}`);
export const createProject = (body: {
  name: string;
  customerId: string;
  type: 'integration' | 'migration';
  product?: string;
}) => post<Project>('/projects', body);

// --- Canonical schema shapes (mirror @etl/schema-model) ---------------------

export type Certainty = 'confirmed' | 'strong_inference' | 'weak_assumption' | 'needs_confirmation';

export interface Field {
  id: string;
  name: string;
  ordinal: number;
  dataType: string;
  nativeType?: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  description?: string;
  annotations?: {
    pii?: string;
    detectedFormat?: string;
    inferredMeaning?: string;
    isLikelyIdentifier?: boolean;
  };
  profile?: {
    nullRate?: number;
    distinctCount?: number;
    duplicateCount?: number;
    sampleValues?: unknown[];
  };
}

export interface Relationship {
  id: string;
  fromEntityId: string;
  fromFields: string[];
  toEntityId: string;
  toFields: string[];
  declared: boolean;
  certainty: Certainty;
}

export interface Entity {
  id: string;
  name: string;
  namespace?: string;
  kind: string;
  classification?: string;
  inferredPurpose?: string;
  estimatedRowCount?: number;
  fields: Field[];
  primaryKey?: string[];
}

export interface CanonicalSchema {
  id: string;
  name: string;
  intakeMethod: string;
  entities: Entity[];
  relationships: Relationship[];
}

export interface SchemaSummary {
  id: string;
  name: string;
  intakeMethod: string;
  connectionId: string | null;
  createdAt: string;
}

export interface SchemaDetail {
  id: string;
  name: string;
  intakeMethod: string;
  model: CanonicalSchema;
  profiles: Array<{ entityName: string; stats: unknown }>;
}

export const listSchemas = () => api<SchemaSummary[]>('/schemas');
export const getSchema = (id: string) => api<SchemaDetail>(`/schemas/${id}`);
export const discoverSchema = (connectionId: string) => post('/schemas/discover', { connectionId });
export const uploadDdl = (name: string, ddl: string) => post('/schemas/upload/ddl', { name, ddl });
export const uploadDictionary = (name: string, csv: string) =>
  post('/schemas/upload/dictionary', { name, csv });
export const uploadSample = (
  name: string,
  format: 'csv' | 'json' | 'xml' | 'delimited',
  content: string,
  extra?: { delimiter?: string; recordPath?: string },
) => post('/schemas/upload/sample', { name, format, content, ...extra });
export const uploadFixedWidth = (name: string, layoutDoc: string, sample?: string) =>
  post<{ schemaModelId: string; fields: number; rowsSampled: number; layout: Array<{ name: string; start: number; width: number; type?: string }> }>(
    '/schemas/upload/fixed-width',
    { name, layoutDoc, sample },
  );
export const uploadHl7 = (name: string, content: string) =>
  post<{ schemaModelId: string; entities: number; messages: number; patients: number; transactions: number }>(
    '/schemas/upload/hl7',
    { name, content },
  );
export const snapshotSchema = (id: string) => post(`/schemas/${id}/snapshot`, {});

// --- Source understanding & mapping (Phase 4) -------------------------------

export interface Evidence {
  kind: string;
  detail: string;
  ref?: string;
}

export interface TableInsight {
  entityRef: string;
  likelyPurpose: string;
  likelyEntity: string;
  classification: string;
  importantFields: string[];
  certainty: Certainty;
  evidence: Evidence[];
  needsUserConfirmation: boolean;
}

export interface SourceOverview {
  id: string;
  generatedBy: string;
  tables: TableInsight[];
  suggestedJoinPaths: Array<{ from: string; to: string; via: string; certainty: Certainty }>;
  areasRequiringConfirmation: string[];
}

export const getOverview = (schemaId: string) => api<SourceOverview>(`/schemas/${schemaId}/overview`);
export const generateOverview = (schemaId: string) =>
  post<SourceOverview>(`/schemas/${schemaId}/overview`, {});

export interface MappingSuggestion {
  id: string;
  sourceField: string | null;
  targetField: string;
  mappingType: string;
  confidence: number;
  reasoning: string;
  evidence: Evidence[];
  risks: string[];
  requiresHumanConfirmation: boolean;
  status: 'proposed' | 'accepted' | 'rejected' | 'modified';
}

export interface MappingSuggestionSet {
  generatedBy: string;
  suggestions: MappingSuggestion[];
  unmappedSources: string[];
  missingRequiredTargets: string[];
}

export const suggestMappings = (sourceSchemaId: string, targetSchemaId: string, projectId?: string) =>
  post<MappingSuggestionSet>('/mappings/suggest', { sourceSchemaId, targetSchemaId, projectId });

export const listSuggestions = (projectId: string) =>
  api<MappingSuggestion[]>(`/mappings/suggestions?projectId=${projectId}`);

export const sendMappingFeedback = (
  suggestionId: string,
  decision: 'accepted' | 'rejected' | 'modified',
  editedPayload?: unknown,
) => post(`/mappings/suggestions/${suggestionId}/feedback`, { decision, editedPayload });

// --- Validations & transformations (Phase 5) --------------------------------

export interface ConfigSuggestion {
  id: string;
  status: string;
  ruleType?: string;
  level?: string;
  fields?: string[];
  severity?: string;
  rationale?: string;
  certainty?: Certainty;
  targetField?: string;
  steps?: Array<{ kind: string }>;
  explanation?: string;
}

export const suggestValidations = (projectId: string, targetSchemaId: string) =>
  post<ConfigSuggestion[]>(`/projects/${projectId}/validations/suggest`, { targetSchemaId });
export const listValidationSuggestions = (projectId: string) =>
  api<ConfigSuggestion[]>(`/projects/${projectId}/validations/suggestions`);
export const suggestTransformations = (projectId: string) =>
  post<ConfigSuggestion[]>(`/projects/${projectId}/transformations/suggest`, {});
export const listTransformationSuggestions = (projectId: string) =>
  api<ConfigSuggestion[]>(`/projects/${projectId}/transformations/suggestions`);
export const decideConfigSuggestion = (suggestionId: string, decision: 'accepted' | 'rejected') =>
  post(`/config/suggestions/${suggestionId}/decision`, { decision });

// --- Test runs (Phase 5) ----------------------------------------------------

export interface TestRunResult {
  runId: string;
  versionId: string;
  metrics: {
    sourceRecords: number;
    acceptedRecords: number;
    rejectedRecords: number;
    duplicateRecords: number;
    warnings: number;
  };
  reconciliation: { sourceCount: number; targetReadyCount: number; rejected: number; duplicateTargets: number; passed: boolean };
  preview: Array<{ source: Record<string, unknown>; target: Record<string, unknown>; passed: boolean }>;
  rejects: Array<{ recordKey: string; reason: string; failingRule: string }>;
  explanation: {
    plainEnglish: string;
    probableCause: string;
    suggestedActions: string[];
    byField: Array<{ field: string; count: number; ruleTypes: string[] }>;
  };
  delivery: { connectionId: string; created: number; failed: number; skipped: number; errors: unknown[] } | null;
  csvOutput: string;
  outputRecords: number;
}

export const runTest = (
  projectId: string,
  sampleRecords: Record<string, unknown>[],
  opts?: { deliverToConnectionId?: string; targetSchemaId?: string },
) => post<TestRunResult>(`/projects/${projectId}/test`, { sampleRecords, ...opts });
export const listRuns = (projectId: string) => api<Run[]>(`/projects/${projectId}/runs`);

export interface Run {
  id: string;
  mode: string;
  status: string;
  metrics: { sourceRecords?: number; acceptedRecords?: number; rejectedRecords?: number } | null;
  projectVersionId: string;
  createdAt: string;
  finishedAt: string | null;
}

// --- Pipeline schedule (saved, schedulable ETL) -----------------------------

export interface PipelineSchedule {
  id: string;
  cron: string;
  enabled: boolean;
  sourceConnectionId: string | null;
  sourceEntity: string | null;
  destinationConnectionId: string | null;
  outputMode: 'api' | 'csv' | 'both';
  targetSchemaId: string | null;
  lastRunAt: string | null;
  lastRunId: string | null;
  lastStatus: string | null;
}

export const getSchedule = (projectId: string) => api<PipelineSchedule | null>(`/projects/${projectId}/schedule`);
export const saveSchedule = (
  projectId: string,
  body: {
    cron: string;
    enabled: boolean;
    sourceConnectionId?: string;
    sourceEntity?: string;
    destinationConnectionId?: string;
    outputMode: 'api' | 'csv' | 'both';
    targetSchemaId?: string;
  },
) => api<PipelineSchedule>(`/projects/${projectId}/schedule`, { method: 'PUT', body: JSON.stringify(body) });
export const runScheduleNow = (projectId: string) =>
  post<{ runId: string; metrics: Record<string, number>; delivery: unknown; outputKey: string | null; outputRecords: number }>(
    `/projects/${projectId}/schedule/run-now`,
    {},
  );

// --- Migration (Phase 6) ----------------------------------------------------

export interface MigrationPlan {
  planId: string;
  sequence: Array<{ entity: string; order: number; wave: number; dependsOn: string[]; reason: string }>;
  cyclesBrokenBetween: Array<[string, string]>;
}
export const buildMigrationPlan = (projectId: string, schemaId: string) =>
  post<MigrationPlan>(`/projects/${projectId}/migration/plan`, { schemaId });
export const getMigrationPlan = (projectId: string) =>
  api<{ planId: string; entities: Array<{ entityName: string; sequence: number; wave: number; dependsOn: string[] }> } | null>(
    `/projects/${projectId}/migration`,
  );

// --- Versions & approval (Phase 6) ------------------------------------------

export interface Version {
  id: string;
  versionNumber: number;
  status: string;
  deployedAt: string | null;
  createdAt: string;
  mappings?: unknown[];
  validations?: unknown[];
}
export const listVersions = (projectId: string) => api<Version[]>(`/projects/${projectId}/versions`);
export const submitVersion = (projectId: string, versionId: string) =>
  post<Version>(`/projects/${projectId}/versions/${versionId}/submit`, {});
export const approveVersion = (projectId: string, versionId: string, decision: 'approved' | 'changes_requested', notes?: string) =>
  post<Version>(`/projects/${projectId}/versions/${versionId}/approve`, { decision, notes });
export const generateDocument = (projectId: string, versionId: string) =>
  post<{ id: string; storageKey: string | null; markdown: string }>(`/projects/${projectId}/versions/${versionId}/document`, {});

// --- Reference docs + transformation-layer generation -----------------------

export interface ProjectDoc {
  id: string;
  title: string;
  kind: string;
  content: string;
  createdAt: string;
}
export const listProjectDocs = (projectId: string) => api<ProjectDoc[]>(`/projects/${projectId}/docs`);
export const addProjectDoc = (projectId: string, body: { title: string; kind: string; content: string }) =>
  post<ProjectDoc>(`/projects/${projectId}/docs`, body);

export interface GeneratedLayer {
  docTermsUsed: number;
  summary: { mappings: number; transformations: number; validations: number; unmappedSources: number; missingRequiredTargets: number };
  transformations: Array<{ targetField: string; steps: Array<{ kind: string }>; explanation: string }>;
  validations: Array<{ ruleType: string; fields: string[]; severity: string }>;
  unmappedSources: string[];
  missingRequiredTargets: string[];
}
export const generateLayer = (projectId: string, sourceSchemaId: string, targetSchemaId: string) =>
  post<GeneratedLayer>(`/mappings/generate-layer/${projectId}`, { sourceSchemaId, targetSchemaId });

// --- Lateral Intelligence (NAI Analyst) -------------------------------------

export interface IntelOverview {
  kpis: {
    active_accounts: number;
    current_outstanding_balance: number;
    net_collections: number;
    promise_kept_rate: number;
  };
  dataFreshness: string;
}
export const intelOverview = () => api<IntelOverview>('/intelligence/overview');

export interface IntelMetric {
  metric_id: string;
  display_name: string;
  description: string;
  format: string;
  certification: string;
  sensitivity: string;
  version: string;
}
export const intelMetrics = () => api<IntelMetric[]>('/intelligence/catalog/metrics');

export interface Breakdown {
  key: string;
  accounts: number;
  balance: number;
}
export interface AskPopulationResult {
  kind: 'population';
  answer: string;
  accounts: number;
  balance: number;
  criteria: string;
  predicates: unknown[];
  breakdowns: Record<string, Breakdown[]>;
  dataFreshness: string;
  assumptions: string[];
  followUps: string[];
  actions: string[];
}
export interface AskMetricResult {
  kind: 'metric';
  answer: string;
  metricsUsed: string[];
  definitions: Array<Record<string, unknown>>;
  rows: Array<Record<string, unknown>>;
  dataFreshness: string;
  assumptions: string[];
}
export interface AskClarifyResult {
  kind: 'clarify';
  clarify: string;
}
export type AskResult = AskPopulationResult | AskMetricResult | AskClarifyResult;
export const intelAsk = (nl: string) => post<AskResult>('/intelligence/ask', { nl });

export interface Population {
  id: string;
  name: string;
  type: string;
  predicates: unknown[];
  breakdowns: unknown[];
  createdAt: string;
}
export const listPopulations = () => api<Population[]>('/intelligence/populations');
export const savePopulation = (name: string, predicates: unknown[], breakdowns?: string[]) =>
  post<{ id: string; name: string; type: string }>('/intelligence/populations', { name, predicates, breakdowns });

export interface ActionPreview {
  actionId: string;
  actionType: 'create_worklist';
  selected: number;
  eligible: number;
  excluded: number;
  excludedReasons: Record<string, number>;
  eligibleBalance: number;
  params: Record<string, unknown>;
}
export const previewAction = (populationId: string, params: Record<string, unknown>) =>
  post<ActionPreview>('/intelligence/actions/preview', { populationId, actionType: 'create_worklist', params });

export interface ActionResult {
  actionId: string;
  ref: string;
  added: number;
  failed: number;
  deepLink: string;
}
export const confirmAction = (actionId: string) =>
  post<ActionResult>(`/intelligence/actions/${actionId}/confirm`, {});

export interface AuditEvent {
  id: string;
  category: string;
  action: string;
  userId: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}
export const listAudit = (category?: string) =>
  api<AuditEvent[]>(`/intelligence/audit${category ? `?category=${category}` : ''}`);

// --- Report builder ---------------------------------------------------------

export interface CatalogMetric {
  metric_id: string;
  display_name: string;
  description: string;
  format: 'count' | 'currency' | 'percent';
  certification: string;
  from: string;
}
export interface CatalogDimension {
  name: string;
  label: string;
  view: string;
}
export interface ReportCatalog {
  metrics: CatalogMetric[];
  dimensions: CatalogDimension[];
  fields: Array<{ name: string; type: string; label: string }>;
}
export const reportCatalog = () => api<ReportCatalog>('/intelligence/report-catalog');

export interface ReportSpec {
  metrics: string[];
  dimensions?: string[];
  filters?: Array<{ field: string; operator: string; value?: string | number }>;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  chart?: 'bar' | 'line' | 'none';
}
export interface ReportRun {
  rows: Array<Record<string, unknown>>;
  columns: string[];
  metrics: Array<{ id: string; display_name: string; format: string; description: string }>;
  warnings: string[];
  dataFreshness: string;
}
export const runReport = (spec: ReportSpec) => post<ReportRun>('/intelligence/reports/run', { spec });

export interface AssistResult {
  understood: string;
  assumptions: string[];
  planner: 'ai' | 'deterministic';
  spec: ReportSpec | null;
  clarify?: string;
}
export const assistReport = (nl: string) => post<AssistResult>('/intelligence/reports/assist', { nl });

export interface SavedReport {
  id: string;
  name: string;
  spec: ReportSpec;
  cron: string | null;
  enabled: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastRows: number | null;
  createdAt: string;
  updatedAt: string;
}
export const listReports = () => api<SavedReport[]>('/intelligence/reports');
export const saveReport = (name: string, spec: ReportSpec) => post<SavedReport>('/intelligence/reports', { name, spec });
export const runSavedReport = (id: string) => api<{ report: { id: string; name: string; spec: ReportSpec } } & ReportRun>(`/intelligence/reports/${id}/run`);
export const runReportNow = (id: string) => post<{ rows: number; outputKey: string | null }>(`/intelligence/reports/${id}/run-now`, {});
export const scheduleReport = (id: string, cron: string | null, enabled: boolean) =>
  api<SavedReport>(`/intelligence/reports/${id}/schedule`, { method: 'PUT', body: JSON.stringify({ cron, enabled }) });
export const deleteReport = (id: string) => api<{ deleted: boolean }>(`/intelligence/reports/${id}`, { method: 'DELETE' });

/** Download a saved report's CSV (auth header → blob → browser download). */
export async function downloadReportCsv(id: string, name: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/intelligence/reports/${id}/export`, {
    headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
  });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^\w.-]+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
