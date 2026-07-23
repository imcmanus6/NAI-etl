/**
 * @nai/core — reporting-schema binding.
 *
 * The catalog is authored against the logical `reporting.*` schema. A real
 * deployment points an edition at its own **per-client, read-only** reporting
 * schema (Postgres) via `NAI_REPORTING_SCHEMA` — e.g. `uscollect`. The compiler
 * rewrites the qualified prefix at SQL-generation time and the guard's
 * allow-list resolves to the same schema, so isolation is preserved end-to-end.
 */

let cached: string | null = null;

/** Active reporting schema (default `reporting`). Validated: lowercase ident. */
export function reportingSchema(): string {
  if (cached) return cached;
  const raw = (typeof process !== 'undefined' && process.env && process.env.NAI_REPORTING_SCHEMA) || 'reporting';
  if (!/^[a-z_][a-z0-9_]*$/.test(raw)) throw new Error(`invalid NAI_REPORTING_SCHEMA: ${raw}`);
  cached = raw;
  return raw;
}

/** Rewrite catalog-authored `reporting.` prefixes to the active schema. */
export function applySchema(sql: string): string {
  const s = reportingSchema();
  return s === 'reporting' ? sql : sql.replace(/\breporting\./g, `${s}.`);
}

/** For tests: reset the cached schema. */
export function _resetSchemaCache(): void {
  cached = null;
}
