/**
 * @nai/core — governed semantic catalog.
 *
 * The AI planner and the SQL compiler both work from THIS catalog, never the raw
 * schema — so questions can only reference certified metrics, known dimensions
 * and allow-listed reporting views. Each field carries a sensitivity class used
 * for permission-based masking. This demo catalog targets the synthetic
 * `reporting.*` schema; a real edition ships its metric pack via an adapter.
 */

export type Sensitivity = 'public' | 'financial' | 'pii' | 'account_level';

export interface FieldDef {
  name: string;
  view: string; // allow-listed reporting view/table
  column: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sensitivity: Sensitivity;
  dimension?: boolean; // usable as a group-by
  label?: string;
}

/** Allow-listed reporting views (only these may appear in compiled SQL). */
export const REPORTING_VIEWS = ['reporting.account_current', 'reporting.payment', 'reporting.promise'] as const;

/** Fields on reporting.account_current (the population + inventory surface). */
export const FIELDS: Record<string, FieldDef> = {
  account_id: { name: 'account_id', view: 'reporting.account_current', column: 'account_id', type: 'number', sensitivity: 'account_level' },
  status: { name: 'status', view: 'reporting.account_current', column: 'status', type: 'string', sensitivity: 'public', dimension: true },
  workflow: { name: 'workflow', view: 'reporting.account_current', column: 'workflow', type: 'string', sensitivity: 'public', dimension: true },
  account_type: { name: 'account_type', view: 'reporting.account_current', column: 'account_type', type: 'string', sensitivity: 'public', dimension: true },
  jurisdiction: { name: 'jurisdiction', view: 'reporting.account_current', column: 'jurisdiction', type: 'string', sensitivity: 'public', dimension: true },
  client: { name: 'client', view: 'reporting.account_current', column: 'client_name', type: 'string', sensitivity: 'public', dimension: true, label: 'Client' },
  collector: { name: 'collector', view: 'reporting.account_current', column: 'collector_name', type: 'string', sensitivity: 'public', dimension: true, label: 'Collector' },
  team: { name: 'team', view: 'reporting.account_current', column: 'team', type: 'string', sensitivity: 'public', dimension: true },
  current_balance: { name: 'current_balance', view: 'reporting.account_current', column: 'current_balance', type: 'number', sensitivity: 'financial' },
  placed_balance: { name: 'placed_balance', view: 'reporting.account_current', column: 'placed_balance', type: 'number', sensitivity: 'financial' },
  last_successful_contact_at: { name: 'last_successful_contact_at', view: 'reporting.account_current', column: 'last_successful_contact_at', type: 'date', sensitivity: 'public' },
  last_activity_at: { name: 'last_activity_at', view: 'reporting.account_current', column: 'last_activity_at', type: 'date', sensitivity: 'public' },
  has_active_promise: { name: 'has_active_promise', view: 'reporting.account_current', column: 'has_active_promise', type: 'boolean', sensitivity: 'public' },
  has_compliance_hold: { name: 'has_compliance_hold', view: 'reporting.account_current', column: 'has_compliance_hold', type: 'boolean', sensitivity: 'public' },
  has_active_arrangement: { name: 'has_active_arrangement', view: 'reporting.account_current', column: 'has_active_arrangement', type: 'boolean', sensitivity: 'public' },
  is_locked: { name: 'is_locked', view: 'reporting.account_current', column: 'is_locked', type: 'boolean', sensitivity: 'public' },

  // --- Inventory-search fields (client-requested "35 filters"; mostly case +
  // debtor columns, plus a few history-derived last-* dates). ----------------
  assigned_at: { name: 'assigned_at', view: 'reporting.account_current', column: 'opened_at', type: 'date', sensitivity: 'public', label: 'Assignment date' },
  amount_paid: { name: 'amount_paid', view: 'reporting.account_current', column: 'amount_paid', type: 'number', sensitivity: 'financial', label: 'Amount paid' },
  last_payment_at: { name: 'last_payment_at', view: 'reporting.account_current', column: 'last_payment_at', type: 'date', sensitivity: 'public', label: 'Last payment date' },
  last_call_result_at: { name: 'last_call_result_at', view: 'reporting.account_current', column: 'last_call_result_at', type: 'date', sensitivity: 'public', label: 'Last call result date' },
  last_call_result: { name: 'last_call_result', view: 'reporting.account_current', column: 'last_call_result', type: 'string', sensitivity: 'public', dimension: true, label: 'Last call result' },
  last_email_at: { name: 'last_email_at', view: 'reporting.account_current', column: 'last_email_at', type: 'date', sensitivity: 'public', label: 'Last email date' },
  last_sms_at: { name: 'last_sms_at', view: 'reporting.account_current', column: 'last_sms_at', type: 'date', sensitivity: 'public', label: 'Last SMS date' },
  last_letter_at: { name: 'last_letter_at', view: 'reporting.account_current', column: 'last_letter_at', type: 'date', sensitivity: 'public', label: 'Last letter date' },
  next_contact_at: { name: 'next_contact_at', view: 'reporting.account_current', column: 'next_contact_at', type: 'date', sensitivity: 'public', label: 'Next contact date' },
  province: { name: 'province', view: 'reporting.account_current', column: 'province', type: 'string', sensitivity: 'public', dimension: true, label: 'Province / state' },
  has_phone: { name: 'has_phone', view: 'reporting.account_current', column: 'has_phone', type: 'boolean', sensitivity: 'public', label: 'Has phone' },
  has_email: { name: 'has_email', view: 'reporting.account_current', column: 'has_email', type: 'boolean', sensitivity: 'public', label: 'Has email' },
  credit_score: { name: 'credit_score', view: 'reporting.account_current', column: 'credit_score', type: 'number', sensitivity: 'pii', label: 'Credit score' },
};

export interface MetricDef {
  metric_id: string;
  display_name: string;
  description: string;
  /** SQL expression producing the measure over `from` (aggregate). */
  expr: string;
  from: string; // allow-listed view
  where?: string; // static predicate (safe, catalog-authored)
  sensitivity: Sensitivity;
  certification: 'certified' | 'draft';
  version: number;
  format: 'count' | 'currency' | 'percent';
}

/** Certified metric catalog (subset for the MVP demo). */
export const METRICS: Record<string, MetricDef> = {
  total_accounts: { metric_id: 'total_accounts', display_name: 'Total accounts', description: 'Count of accounts.', expr: 'count(*)', from: 'reporting.account_current', sensitivity: 'public', certification: 'certified', version: 1, format: 'count' },
  active_accounts: { metric_id: 'active_accounts', display_name: 'Active accounts', description: 'Accounts in active status.', expr: 'count(*)', from: 'reporting.account_current', where: "status = 'active'", sensitivity: 'public', certification: 'certified', version: 1, format: 'count' },
  current_outstanding_balance: { metric_id: 'current_outstanding_balance', display_name: 'Current outstanding balance', description: 'Sum of current balances.', expr: 'coalesce(sum(current_balance),0)', from: 'reporting.account_current', where: "status = 'active'", sensitivity: 'financial', certification: 'certified', version: 1, format: 'currency' },
  net_collections: { metric_id: 'net_collections', display_name: 'Net collections', description: 'Sum of net payment amounts.', expr: 'coalesce(sum(net_amount),0)', from: 'reporting.payment', sensitivity: 'financial', certification: 'certified', version: 1, format: 'currency' },
  payments_count: { metric_id: 'payments_count', display_name: 'Payments', description: 'Number of payments.', expr: 'count(*)', from: 'reporting.payment', sensitivity: 'financial', certification: 'certified', version: 1, format: 'count' },
  promises_due: { metric_id: 'promises_due', display_name: 'Promises due', description: 'Promises with a due date in period.', expr: "count(*) filter (where status in ('kept','broken'))", from: 'reporting.promise', sensitivity: 'public', certification: 'certified', version: 1, format: 'count' },
  promises_kept: { metric_id: 'promises_kept', display_name: 'Promises kept', description: 'Promises fulfilled.', expr: "count(*) filter (where status = 'kept')", from: 'reporting.promise', sensitivity: 'public', certification: 'certified', version: 1, format: 'count' },
  promise_kept_rate: { metric_id: 'promise_kept_rate', display_name: 'Promise kept rate', description: 'Kept / (kept+broken).', expr: "round(100.0 * count(*) filter (where status='kept') / nullif(count(*) filter (where status in ('kept','broken')),0), 1)", from: 'reporting.promise', sensitivity: 'public', certification: 'certified', version: 1, format: 'percent' },
  collection_rate: { metric_id: 'collection_rate', display_name: 'Collection rate', description: 'Net collections / placed balance (approx).', expr: "round(100.0 * (select coalesce(sum(net_amount),0) from reporting.payment) / nullif((select sum(placed_balance) from reporting.account_current),0), 1)", from: 'reporting.account_current', sensitivity: 'financial', certification: 'draft', version: 1, format: 'percent' },
};

export const isField = (name: string): FieldDef | undefined => FIELDS[name];
export const isMetric = (id: string): MetricDef | undefined => METRICS[id];
