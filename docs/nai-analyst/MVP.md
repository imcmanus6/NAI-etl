# NAI Analyst — MVP: Data Model, UI, API, Plan, Risks, Assumptions, Questions

Covers required outputs **12–18**.

## 12. MVP data model (NAI control DB)

Multi-tenant, `tenant_id`-scoped, RLS. **No client operational data here** — only platform
metadata. (Reporting data lives read-only in each client's reporting DB.)

| Table | Purpose | Key fields |
|-------|---------|-----------|
| `tenant`, `client`, `user_context` | edition-agnostic identity cache (from Lateral token) | tenant_id, client_id, external_user_id, permissions[] |
| `reporting_connection` | per-client read-only conn profile | tenant_id, dialect, host, db, `secret_ref`, last_refreshed_at |
| `reporting_view` | catalog of `reporting.*` views | id, name, grain, columns[], joins, lineage, permission_tags |
| `metric` / `metric_version` | certified metric defs (+ tenant overrides) | metric_id, version, definition_json, certification, sensitivity |
| `saved_report` | reports | id, tenant, name, description, plan_json, viz_json, status(draft/personal/shared/certified/archived), visibility, owner |
| `dashboard` / `dashboard_widget` | dashboards | id, name, filters_json; widget: type, report_id/metric, layout |
| `population` | saved populations | id, name, type(static/dynamic), predicates_json, static_ids?, criteria_snapshot |
| `schedule` | scheduled reports | id, report_id, cron, delivery(email/link/notification), recipients, service_identity, metric_version_pins |
| `ai_conversation` / `ai_message` | Ask-AI history | thread, role, nl, plan_ref, result_ref, follow_ups |
| `query_run` | executed queries | id, plan_json, sql_ref, row_count, duration_ms, freshness, status |
| `action_request` | action orchestration records | id, type, population_ref, preview_json, permission_result, eligibility_json, confirmation, lateral_ref, outcome |
| `audit_event` | append-only audit | see [SECURITY.md](./SECURITY.md#11-audit-event-design) |

Reuses `@etl/database` (Prisma) + the existing tenancy/secrets/audit tables where they fit.

## 13. Page-by-page UI plan

New Lateral nav area **Intelligence** (customer-facing **Lateral Intelligence**, subtle
**Powered by NAI**). Lateral branding/nav; no separate login.

| Page | Contents |
|------|----------|
| **Overview** | Executive KPIs (total accounts, balance, payments this month, collection rate, promise-kept rate, contact rate, accounts worked, accounts requiring attention); prominent **"Ask anything about your portfolio"** prompt with example suggestions; **data-freshness** indicator ("Data updated 4 minutes ago"); recent reports, saved populations, scheduled reports, recent actions. |
| **Ask AI** | Conversational analytics: conversation history, suggested questions, current tenant/DB context, date-range + client/portfolio filters, AI answer, generated table + chart, **metrics used / data sources / freshness / filters / assumptions / limitations**, query status + result count, follow-up suggestions, and **Save** / **Action** options. Follow-ups retain context (filter → compare → save-as-report). |
| **Dashboards** | List + builder; widgets (metric cards, line/bar/area/pie/funnel, cohort, aging, exceptions, AI commentary); dashboard filters (date, client, portfolio, team, collector, workflow, account type, jurisdiction, status), permission-respecting. Ships the **5 templates** (Exec Overview, Client Performance, Collector Performance, Workflow Effectiveness, Data & Compliance Exceptions). |
| **Reports** | Create from NL / saved answer / visual builder / dataset / template; configure name, source, metrics, dimensions, filters, date range, grouping, sorting, chart, columns, visibility, export perm, schedule, recipients; statuses draft/personal/shared/certified/archived. |
| **Populations** | Saved account-selection criteria; static vs dynamic; view matching accounts, criteria, total balance, population changes; export; **create worklist**; submit approved batch action. |
| **Scheduled Reports** | Daily/weekly/monthly/weekday/month-end/custom; delivery email/link/notification; runs under service identity. |
| **Actions** | Action framework UI: propose → **preview** (affected/eligible/excluded + reasons + balance) → permission → **explicit confirm** → execute → result + deep link + audit. **Create Worklist** first. |
| **Audit History** | Filterable audit (user/date/report/account/action/status/tenant/client/Audit ID); no chain-of-thought. |

**Answer format (every analytical response):** concise answer · table/chart · filters ·
date range · metric definitions · freshness · assumptions · limitations · follow-ups ·
available actions. Inference/correlation is labelled.

## 14. API endpoint plan (`analyst-api`)

All authenticated by the Lateral context token; tenant/permissions derived from it.

```
POST /ask                      NL question → { answer, plan, table, chart, definitions, freshness, followups, actions }
POST /ask/plan                 NL → structured plan only (no execution)
POST /query                    execute a validated plan → result (with row/permission caps)
GET  /catalog/metrics          certified metrics (permission-filtered)
GET  /catalog/views            reporting views + descriptions
GET  /overview                 executive KPI bundle + freshness + recent items
POST /reports  GET /reports  GET /reports/:id  PATCH /reports/:id  POST /reports/:id/certify
POST /dashboards  GET /dashboards/:id  (+ widgets)
POST /populations  GET /populations/:id  GET /populations/:id/accounts  POST /populations/:id/refresh
POST /schedules  GET /schedules  POST /schedules/:id/run-now
POST /actions/preview          { actionType, population } → affected/eligible/excluded + value
POST /actions/:id/confirm      explicit confirm → executes via Lateral API → result + audit
GET  /actions/:id
GET  /audit                    filterable audit
GET  /links/account/:id        resolve Lateral deep-link URL (via adapter)
POST /sql                      restricted SQL mode (separate permission; Guard-validated)
```

## 15. Phased implementation plan

**Phase 0 — foundations (reusable core, no Lateral needed).** analyst-api/web scaffold in
the monorepo; Tenant Connection Manager + read-only connector (reuse `@etl/connectors`);
Metric Catalog + Reporting View Catalog; SQL compiler + **SQL Guard**; control-DB schema;
Lateral context-token verification (mockable). **Synthetic collections reporting DB** +
seed so the whole flow is demoable before real Lateral access.

**Phase 1 — Ask → Analyze → Visualize.** AI Analyst (NL→plan via `@etl/ai-service`); plan
validation + compile + execute; table + basic charts; answer format with definitions/
freshness/assumptions; Overview page; conversation follow-ups.

**Phase 2 — Save & organize.** Save as report; report statuses; 5 dashboard templates;
Populations (static + dynamic); export (permission-scoped).

**Phase 3 — Act (Create Worklist).** Action Orchestrator state machine; preview →
permission → eligibility → confirm → execute → audit; **Lateral Action API client**
(Create Worklist); deep links back to accounts.

**Phase 4 — Schedule & audit.** Scheduled reports under service identity; delivery
(email/link/notification); full Audit History UI + admin filters.

**Phase 5 — Harden & embed.** Metabase wrapped behind the visualization adapter (if used);
caching + async large reports; embedding/SSO with real Lateral; per-client rollout.

Each phase is demoable. The core stays edition-agnostic; Lateral specifics stay in the
adapter.

## 16. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| AI writes to / corrupts operational data | Read-only creds + SQL Guard + actions only via Lateral API; **structurally impossible** to write from the analytics path |
| AI invents metrics/joins → wrong numbers | Governed catalog only; certified metrics; plan validated against catalog; formulas never invented; inference labelled |
| PII/financial over-exposure | Column sensitivity tags + permission-based masking; aggregate-without-records; audit of every access |
| Prompt injection via data/questions | Model only sees catalog metadata, not raw rows for planning; results never fed back as instructions; SQL is compiled, not model-emitted |
| Action executed without authority | Orchestrator: permission → eligibility → explicit confirm; Lateral re-authorizes on execute; limits + optional dual approval |
| Stale scheduled-report permissions | Service identity with pinned, explicit permissions + metric versions — not the creator's live grants |
| Cross-client data bleed | Connection chosen server-side from verified tenant; physically separate DBs; no tenant param trusted from client |
| Slow queries block UX | Curated/indexed views + daily summaries + caching + async + timeouts + cancellation |
| Metabase lock-in / licensing | Wrap behind visualization adapter; definitions/permissions/AI stay in NAI; replaceable |
| Reusability erodes (Lateral logic leaks into core) | Hard adapter boundary + interface tests; core has zero Lateral imports |

## 17. Assumptions (stated defaults; each revisitable)

1. Build in this monorepo as `apps/analyst-api` + `apps/analyst-web` + new packages,
   reusing `@etl/connectors|secrets|tenancy|ai-service|audit|storage|database`.
2. Lateral issues a verifiable **JWT context token** (tenant/client/user/permissions);
   analyst-web is **embedded** (iframe or module) sharing that session.
3. Reporting copies are relational (Postgres or MySQL); the compiler is dialect-aware.
4. The **`reporting.*` curated views exist or will be created in the reporting copy** by
   the Lateral data team (NAI can't create them via a read-only conn). Until then, the
   adapter maps directly onto `rdebt_*` with documented joins.
5. AI provider is Anthropic (via `@etl/ai-service`), model selectable per task; a
   deterministic fallback covers plan generation for common questions offline.
6. Metabase *may* be the internal viz engine but is wrapped and optional; MVP ships an
   internal chart renderer so nothing depends on it.
7. **Create Worklist** is the only action in MVP; the framework supports the rest later.
8. One client DB for the MVP; multi-client onboarding is config, not rearchitecture.

## 18. Questions that genuinely block implementation

These gate the **Lateral-specific** parts (the reusable core + synthetic DB can start now):

1. **Reporting DB access** — for one client: dialect (Postgres/MySQL), a **read-only**
   connection, and whether curated `reporting.*` views exist or NAI maps onto `rdebt_*`.
   If the latter, we need the schema (or DDL) and the documented joins.
2. **Canonical metric definitions** — the authoritative business formulas (collection rate,
   liquidation rate, right-party contact, promise grace period, net vs gross, "worked",
   "no recent activity" thresholds). Where are these owned? (Confluence? Ops?)
3. **Lateral auth / embedding** — how does Lateral pass identity + tenant/client +
   permissions to an embedded app (JWT+JWKS? session proxy? iframe postMessage?), and how
   is the UI embedded (iframe route? micro-frontend?)?
4. **Lateral permission model** — is there an entitlements/permission API or claims in the
   token that the Permission Adapter maps to NAI's permission set (incl. PII/financial/
   account-level gates)?
5. **Lateral Action API — Create Worklist** — endpoint, auth, request/response, and whether
   it exposes **eligibility validation / dry-run** (compliance holds, arrangements, locks)
   or returns per-account results on execute.
6. **Account/case deep-link URL pattern** (e.g. `…nodec.lateral1.com/b/…/case/{id}`).
7. **Data freshness** — the reporting copy's refresh mechanism/cadence + a
   `last_refreshed_at` watermark to display.
8. **Metabase** — is it in for MVP as the viz engine, and are embedding + licensing sorted?
9. **PII/compliance posture** — masking rules, jurisdictions, retention/residency for the
   NAI control DB and audit.

## Example MVP scenario (the target end-to-end)

```text
"Active accounts > $2,500, no successful contact in 14 days, no active promise, no compliance hold"
  → 437 accounts · $2.8m · breakdown by collector/client/workflow · freshness · criteria
  → Save as "High Balance Inactive Accounts" (dynamic population)
  → Create worklist for Early Resolution Team
      → preview: 437 selected → 415 eligible / 22 excluded (+reasons) → confirm
      → Lateral API creates worklist · 415 added · deep link · full audit record
```
This exact flow is the MVP's definition of done.
