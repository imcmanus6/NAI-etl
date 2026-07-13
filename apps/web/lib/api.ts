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
export const uploadSample = (name: string, format: 'csv' | 'json', content: string) =>
  post('/schemas/upload/sample', { name, format, content });
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
