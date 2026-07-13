/**
 * Lateral destination connector.
 *
 * Writes records to a Lateral import endpoint (e.g. the GB Collects
 * `gb_collects_import/receive?importType=case_simple` plugin). Records are
 * posted as `{ records: [...] }` with a Bearer token resolved at execution time
 * from the secrets abstraction — never stored in the connection config.
 *
 * Config:  { baseUrl, importType? }
 * Secrets: { token }
 * Response (observed): { success, message, records_received }
 */
import type {
  Connector,
  ConnectionRuntime,
  ConnectorCapabilities,
  SourceRecord,
  TestConnectionResult,
  WriteOptions,
  WriteResult,
} from '@etl/connector-sdk';

const CAPS: ConnectorCapabilities = {
  canTestConnection: true,
  canDiscoverSchema: false,
  canReadData: false,
  canWriteData: true,
  supportsPagination: false,
  supportsIncrementalExtraction: false,
  supportsChangeTracking: false,
  supportsStreaming: false,
  supportsBatchWrites: true,
  supportsTransactions: false,
  supportsSchemaInference: false,
};

interface LateralResponse {
  success?: boolean;
  message?: string;
  records_received?: number;
  [k: string]: unknown;
}

export class LateralConnector implements Connector {
  readonly type = 'lateral' as const;
  readonly capabilities = CAPS;

  private endpoint(conn: ConnectionRuntime): string {
    const base = String(conn.config.baseUrl ?? '');
    const importType = conn.config.importType as string | undefined;
    if (!base) throw new Error('Lateral connection has no baseUrl');
    if (!importType) return base;
    return `${base}${base.includes('?') ? '&' : '?'}importType=${encodeURIComponent(importType)}`;
  }

  private async post(conn: ConnectionRuntime, records: SourceRecord[]): Promise<{ ok: boolean; status: number; body: LateralResponse }> {
    const token = conn.secrets.token;
    if (!token) throw new Error('Lateral connection is missing its token secret');
    const res = await fetch(this.endpoint(conn), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ records }),
    });
    const text = await res.text();
    let body: LateralResponse;
    try {
      body = JSON.parse(text) as LateralResponse;
    } catch {
      body = { raw: text };
    }
    return { ok: res.ok && body.success !== false, status: res.status, body };
  }

  async testConnection(conn: ConnectionRuntime): Promise<TestConnectionResult> {
    try {
      // Empty import: harmless (creates nothing). A 400 "no records" still proves
      // we reached AND authenticated with the endpoint; only 401/403 = bad token.
      const res = await this.post(conn, []);
      const authOk = res.status !== 401 && res.status !== 403;
      return {
        ok: authOk,
        message: authOk
          ? `Reachable & authenticated — ${res.body.message ?? 'ok'}`
          : `Authentication failed: HTTP ${res.status}`,
        details: res.body,
      };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  }

  async write(conn: ConnectionRuntime, records: SourceRecord[], _opts: WriteOptions): Promise<WriteResult> {
    if (records.length === 0) return { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
    const res = await this.post(conn, records);
    if (!res.ok) {
      return {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: records.length,
        errors: [{ key: 'batch', message: `HTTP ${res.status}: ${res.body.message ?? JSON.stringify(res.body).slice(0, 200)}` }],
      };
    }
    const received = Number(res.body.records_received ?? records.length);
    return { created: received, updated: 0, skipped: Math.max(0, records.length - received), failed: 0, errors: [] };
  }
}
