/**
 * @etl/tenancy — tenant resolution and query-scoping helpers.
 *
 * Multi-tenancy in the MVP is shared-DB + shared-schema with a mandatory
 * `tenantId` on every scoped query, backed by Postgres Row-Level Security. This
 * package centralises how a tenant is resolved (from host/JWT) and provides a
 * scoping guard used by services and RLS session setup.
 */
import type { TenantId } from '@etl/shared-types';

export interface TenantContext {
  tenantId: TenantId;
  /** The host the request arrived on — drives white-label resolution. */
  host?: string;
}

/**
 * Resolve a tenant from a request. Priority: authenticated JWT claim > host
 * mapping. Host mapping is used for the login page (pre-auth branding).
 */
export interface TenantResolver {
  fromHost(host: string): Promise<TenantId | null>;
}

/** Asserts a value is scoped to the expected tenant; throws on mismatch. */
export function assertTenant(expected: TenantId, actual: TenantId | null | undefined): void {
  if (actual !== expected) {
    throw new TenantIsolationError(expected, actual ?? null);
  }
}

export class TenantIsolationError extends Error {
  constructor(
    readonly expected: TenantId,
    readonly actual: TenantId | null,
  ) {
    super('Tenant isolation violation: attempted cross-tenant access');
    this.name = 'TenantIsolationError';
  }
}

/**
 * Returns the SQL to set the RLS session variable Postgres policies read.
 * The API/worker runs this at the start of each DB transaction:
 *   SET LOCAL app.tenant_id = '<uuid>';
 */
export function rlsSessionSql(tenantId: TenantId): string {
  // tenantId is a validated uuid from a trusted claim; still guard shape.
  if (!/^[0-9a-fA-F-]{36}$/.test(tenantId)) throw new Error('Invalid tenant id');
  return `SET LOCAL app.tenant_id = '${tenantId}'`;
}

/** Adds tenantId to a Prisma `where` clause. */
export function scopedWhere<T extends object>(tenantId: TenantId, where: T): T & { tenantId: TenantId } {
  return { ...where, tenantId };
}
