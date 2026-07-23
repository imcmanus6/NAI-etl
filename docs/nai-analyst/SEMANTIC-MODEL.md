# NAI Analyst — Semantic Model, Reporting Views & Metrics

Covers required outputs **6 (semantic metric structure)**, **7 (reporting-view plan)**,
the **certified metric list**, and the **structured query representation**.

The semantic layer is what lets the AI be fast and safe: it never sees raw operational
tables, only this **governed catalog** of views, dimensions, filters and certified metrics.

## 7. Reporting-view plan

Curated, documented, permissioned **`reporting.*` views** are the only tables the query
engine may touch. Names below are the *conceptual* set; the Lateral Adapter maps them onto
the real `rdebt_*` schema (see blocking questions). Precomputed `_daily` views back the
speed targets.

| View | Grain | Purpose | Key columns (conceptual) |
|------|-------|---------|--------------------------|
| `reporting.account_current` | account | Current state of each account | account_id, client_id, status, workflow, collector, type, jurisdiction, opened_at, last_activity_at, last_contact_at |
| `reporting.account_balance` | account | Balances | account_id, placed_balance, current_balance, principal, fees, interest, currency |
| `reporting.payment` | payment | Individual payments | payment_id, account_id, date, amount, net_amount, type, collector, client |
| `reporting.payment_daily` | account×day | Precomputed daily payment aggregates | date, account_id, client, collector, gross, net, count |
| `reporting.contact_attempt` | attempt | Every contact attempt | attempt_id, account_id, ts, channel, collector, outcome_id |
| `reporting.contact_outcome` | lookup | Outcome dictionary | outcome_id, is_successful, is_right_party |
| `reporting.promise` | promise | Promises to pay | promise_id, account_id, created_at, due_date, amount, collector |
| `reporting.promise_status` | promise | Kept/broken + grace | promise_id, status, kept_at, grace_days |
| `reporting.workflow_position` | account | Current workflow/stage + entered_at | account_id, workflow, stage, entered_at |
| `reporting.workflow_transition` | transition | Enter/leave events | account_id, from_stage, to_stage, ts |
| `reporting.collector_activity` | collector×day | Accounts worked, attempts | date, collector, accounts_worked, attempts |
| `reporting.collector_performance_daily` | collector×day | Precomputed KPI rollup | date, collector, successful_contacts, rpc, promises, kept, payments |
| `reporting.client_portfolio_summary` | client×day | Portfolio rollup | date, client, accounts, balance, collections |
| `reporting.account_exception` | account | Data/compliance exceptions | account_id, exception_type, detail |

Each view carries **metadata**: documented joins, column descriptions, **data lineage**
(source tables), **permission tags** per column (e.g. `pii`, `financial`, `account_level`),
and a `last_refreshed_at` watermark. The **Reporting View Catalog** stores this so the AI
and the SQL Guard both work from the same governed definitions.

## 6. Semantic metric structure

Every metric is a versioned, certified definition (YAML/JSON), tenant-overridable. The
**Metric Catalog** owns these; the compiler turns a metric + dimensions + filters into SQL
over the reporting views.

```yaml
metric_id: promise_kept_rate
display_name: Promise Kept Rate
description: >
  Percentage of promises due in the selected period that were fulfilled within the
  configured grace period.
formula: kept_promises / promises_due
numerator:
  source: reporting.promise_status
  measure: count
  where: "status = 'kept'"
denominator:
  source: reporting.promise
  measure: count
  where: "due_date in :period"
date_basis: promise_due_date
grain: promise
dimensions: [client, collector, team, workflow, account_type, month]
filters: [jurisdiction, portfolio, placement_date, promise_due_date]
currency_handling: n/a
exclusions: ["compliance_hold promises excluded per policy"]
data_source: [reporting.promise, reporting.promise_status]
data_lineage: "rdebt_promise → reporting.promise(+status)"
data_owner: "Collections Ops"
certification: certified        # draft | certified | deprecated
version: 3
security: { tenant_restricted: true, client_access_restricted: true, sensitivity: financial }
tenant_overrides: true          # e.g. grace_days differs per client
```

**Governance rules:** only `sensitivity`-appropriate users see a metric's output; only
`report.certify` holders can move a metric to `certified`; the AI may only use `certified`
(or, if configured, `draft` with a "not certified" label); formulas are **never invented**
— an uncertified/undefined metric surfaces "definition needs confirmation" and an admin
config point lets owners confirm/modify definitions.

## Initial certified metrics (MVP: ~20)

Grouped; each becomes a Metric-Catalog entry with the structure above. Formulas are
**placeholders pending Lateral's canonical business definitions** (blocking question).

- **Inventory:** total_accounts, active_accounts, closed_accounts
- **Balances:** total_placed_balance, current_outstanding_balance, average_account_balance
- **Collections:** total_payments, gross_collections, net_collections, average_payment,
  collection_rate (= net_collections / placed_balance), liquidation_rate
- **Activity/contact:** accounts_worked, contact_attempts, successful_contacts,
  right_party_contacts, contact_rate, right_party_contact_rate
- **Promises:** promises_created, promises_due, promises_kept, promises_broken,
  promise_kept_rate
- **Workflow/quality:** days_since_last_activity, days_since_last_contact,
  workflow_stage_duration, accounts_entering_workflow, accounts_leaving_workflow,
  collector_productivity, accounts_with_missing_data, accounts_with_no_recent_activity

## Structured query representation

The AI emits this IR (validated against the catalog); the backend compiles it to SQL. This
is the contract between the AI Analyst service and the deterministic engine.

```json
{
  "metrics": ["net_collections"],
  "dimensions": ["collector"],
  "filters": [
    { "field": "payment_date", "operator": "current_month" },
    { "field": "team", "operator": "eq", "value": "US" }
  ],
  "comparison": "previous_month_equivalent_workdays",
  "sort": [{ "field": "net_collections", "direction": "desc" }],
  "limit": 100,
  "output": "table+chart",
  "grain": "aggregate"
}
```

Population selection is the same IR with a `grain: "account"` and a predicate set instead
of metrics:

```json
{
  "grain": "account",
  "select": ["account_id", "client", "collector", "current_balance", "last_contact_at"],
  "predicates": [
    { "field": "status", "operator": "eq", "value": "active" },
    { "field": "current_balance", "operator": "gt", "value": 2500 },
    { "field": "days_since_last_successful_contact", "operator": "gte", "value": 14 },
    { "field": "has_active_promise", "operator": "eq", "value": false },
    { "field": "has_compliance_hold", "operator": "eq", "value": false }
  ],
  "aggregates": ["count", "sum(current_balance)"],
  "breakdowns": ["collector", "client", "workflow"]
}
```

**Compilation guarantees:** every `field` resolves to a catalog dimension/measure with a
known view + column + permission tag; every `operator` is from a fixed set; `limit` is
always applied; unknown fields → the plan is rejected and the AI is asked to clarify.
