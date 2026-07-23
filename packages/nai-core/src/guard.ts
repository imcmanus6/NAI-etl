/**
 * @nai/core — SQL Guard.
 *
 * Last line of defence before a compiled query runs against the read-only DB:
 * single SELECT statement, allow-listed reporting views only, no DDL/DML/DCL, no
 * system schemas, no forbidden functions. Allow-list (not deny-list) is the
 * primary control; the keyword checks are belt-and-braces.
 */
import { REPORTING_VIEWS } from './catalog.js';

const FORBIDDEN =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|merge|call|execute|copy|into|vacuum|analyze|lock|do)\b/i;
const FORBIDDEN_FN = /(pg_read_file|pg_sleep|lo_import|lo_export|dblink|xp_cmdshell)/i;
const SYSTEM = /\b(pg_catalog|information_schema|performance_schema|pg_[a-z_]+\s*\()/i;

export interface GuardResult {
  ok: boolean;
  reason?: string;
}

export function validateSql(sql: string): GuardResult {
  const s = sql.trim().replace(/;+\s*$/, ''); // tolerate a trailing semicolon
  if (/;/.test(s)) return { ok: false, reason: 'multiple statements not allowed' };
  if (!/^(select|with)\b/i.test(s)) return { ok: false, reason: 'only SELECT/WITH statements are allowed' };
  if (FORBIDDEN.test(s)) return { ok: false, reason: 'contains a forbidden keyword (DDL/DML/DCL)' };
  if (FORBIDDEN_FN.test(s)) return { ok: false, reason: 'contains a forbidden function' };
  if (SYSTEM.test(s)) return { ok: false, reason: 'references a system schema/function' };

  // Every FROM/JOIN target must be an allow-listed reporting view.
  const refs = [...s.matchAll(/\b(?:from|join)\s+([a-zA-Z_][\w.]*)/gi)].map((m) => m[1]!.toLowerCase());
  for (const r of refs) {
    if (!(REPORTING_VIEWS as readonly string[]).includes(r)) {
      return { ok: false, reason: `table not allow-listed: ${r}` };
    }
  }
  return { ok: true };
}
