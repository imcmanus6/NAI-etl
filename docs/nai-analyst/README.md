# NAI Analyst — Lateral Intelligence (Phase-1 Design)

> **NAI Analyst** — a reusable AI reporting, analytics and action platform.
> **Lateral Intelligence** — the collections-specific NAI Analyst experience embedded inside Lateral.
> **Cashmere Intelligence** — a future ERP-specific edition of the same platform (out of scope for MVP).

This folder is the design-for-review deliverable requested before implementation.
It covers all 18 required outputs. Read them in order:

| # | Doc | Covers (required outputs) |
|---|-----|---------------------------|
| 1 | [ARCHITECTURE.md](./ARCHITECTURE.md) | 1 architecture · 2 service boundaries · 3 DB connection strategy · 8 AI query flow · 9 SQL safety · query-speed strategy |
| 2 | [SECURITY.md](./SECURITY.md) | 4 security model · 5 permission matrix · 10 action orchestration · 11 audit-event design |
| 3 | [SEMANTIC-MODEL.md](./SEMANTIC-MODEL.md) | 6 semantic metric structure · 7 reporting-view plan · certified metrics · structured query IR |
| 4 | [MVP.md](./MVP.md) | 12 MVP data model · 13 page-by-page UI · 14 API endpoints · 15 phased plan · 16 risks · 17 assumptions · 18 blocking questions |

## Product boundary (non-negotiable)

```text
NAI Analyst  (reusable platform — owned by NAI)
    ├── Connector · Tenant Connection Manager · Schema/View/Metric Catalogs
    ├── Semantic Query · AI Analyst · Report · Dashboard · Population · Schedule
    ├── Permission Adapter · Action Orchestrator · Audit · Visualization Adapter
    └── ADAPTERS ──────────────────────────────────────────────
                    Lateral Adapter (this MVP) · Cashmere Adapter (future)

Lateral Intelligence = NAI Analyst + Lateral Adapter, embedded in the Lateral UI,
using Lateral auth, tenant/client context, permissions, branding and Action APIs.
```

## The three hard rules that shape everything

1. **AI never writes to the operational database.** Analytics use a **read-only** reporting connection; every operational change goes through **authenticated Lateral APIs**. See [SECURITY.md](./SECURITY.md).
2. **AI proposes; Lateral decides.** NAI may recommend/prepare an action, but Lateral owns authorization, validation, business rules, workflow eligibility, compliance, locks, batch execution, transaction integrity and the final audit record.
3. **Per-client isolation.** No shared multi-tenant reporting DB in v1. Each client keeps its own reporting database; NAI resolves the correct connection from the authenticated tenant.

## Core workflow

```text
ASK  →  REPORT  →  ACT
understand   show/visualize/explain   controlled Lateral action (with preview + confirm)
```

## Where it's built

Extends this monorepo (the NAI platform). New apps `apps/analyst-api` + `apps/analyst-web`;
new packages for the semantic/metric/query/action layers; **reuses** `@etl/connectors`
(read-only DB), `@etl/secrets`, `@etl/tenancy`, `@etl/ai-service`, `@etl/audit`,
`@etl/storage`, `@etl/observability`, `@etl/shared-types`. The Lateral-specific parts
live under an isolated `adapters/lateral-*` boundary so a Cashmere adapter can be added
later without touching the core.

> **Status: design only.** No production code yet — see the [blocking questions](./MVP.md#18-questions-that-genuinely-block-implementation) that gate the Lateral-specific parts. The reusable core + a synthetic collections DB can be built immediately to prove the end-to-end MVP flow.
