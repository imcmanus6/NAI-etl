# etl-platform

A **white-label, AI-assisted ETL and data migration platform** for enterprise
software companies. AI does the initial analysis and mapping; humans review,
correct, test and approve **deterministic, versioned, auditable** configuration
before anything runs in production.

> **Status:** Phase 1 + Phase 2 scaffold. The architecture, domain model and
> executable interface contracts are complete; the apps boot and the core
> engines are implemented. Stages beyond the MVP walking skeleton are marked
> with `TODO` in code. See [`docs/`](./docs) for the full design.

## What's here

| Area | Where | Status |
|------|-------|--------|
| Architecture, domain model, workflows, AI tools, MVP plan | [`docs/`](./docs) | ✅ complete |
| Canonical schema, connector SDK, mapping/transform/validation configs | `packages/*` | ✅ typed + deterministic core |
| Control DB (Prisma) | `packages/database` | ✅ schema + seed |
| NestJS API + OpenAPI | `apps/api` | ✅ boots; auth, tenants, projects, connections |
| Temporal worker | `apps/worker` | ✅ boots; schema-intake + test-run workflows |
| Next.js white-label web | `apps/web` | ✅ boots; login + guided dashboard |
| Connectors (postgres, mysql, csv, json) | `packages/connectors` | ✅ test + discover + read |

## Prerequisites

- **Node ≥ 20** (see `.nvmrc`)
- **pnpm ≥ 9** (`corepack enable`)
- **Docker** (for Postgres, Temporal, MinIO)

## Quick start

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env            # defaults work with the docker-compose stack

# 3. Local infra: Postgres, Temporal (+UI :8080), MinIO (:9001)
pnpm docker:up

# 4. Control database: generate client, run migrations, seed a demo tenant
pnpm db:generate
pnpm db:migrate                 # creates the schema (first run: names the migration)
pnpm db:seed                    # login: admin@example.com / demo1234!  (tenant: demo)

# 5. Build shared packages once (apps depend on their compiled output)
pnpm build --filter='./packages/*'

# 6. Run the stack (three terminals, or `pnpm dev` to run all via turbo)
pnpm --filter @etl/api dev      # http://localhost:3001  (OpenAPI at /api/docs)
pnpm --filter @etl/worker dev   # connects to Temporal
pnpm --filter @etl/web dev      # http://localhost:3000
```

Then open **http://localhost:3000**, sign in with the seeded account, and you'll
land on the guided setup flow. The API's OpenAPI explorer is at
**http://localhost:3001/api/docs**.

## Monorepo layout

```
apps/      web (Next.js)  ·  api (NestJS)  ·  worker (Temporal)
packages/  shared-types · database · auth · tenancy · secrets · storage ·
           connector-sdk · connectors · schema-model · schema-discovery ·
           profiling · mapping-engine · transformation-engine ·
           validation-engine · workflow-definitions · ai-service · audit ·
           observability
docs/      ARCHITECTURE · DOMAIN-MODEL · WORKFLOWS · AI-TOOLS · MVP
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full Phase-1 design
(diagram, decisions, risks) and the other docs for details.

## Core principles baked into the code

- **AI proposes, humans approve.** The AI layer (`packages/ai-service`) is
  draft-only — it never writes production config or processes production
  records. Deterministic engines do all record processing.
- **Everything is versioned & auditable.** Deployed `ProjectVersion` rows are
  immutable; every job carries the lineage tuple
  (`tenant/customer/environment/project/version/run`); `packages/audit` records
  an append-only trail.
- **Credentials are never in app tables.** Only opaque `secretRef` pointers are
  stored; workers resolve real values via `packages/secrets`.
- **No heavy work in HTTP handlers.** Long-running extraction/transform/load run
  in Temporal workers with streaming/batch + DuckDB.
- **One codebase, many brands.** White-label theme tokens, terminology and
  enabled modules are per-tenant.

## Useful commands

```bash
pnpm typecheck      # type-check everything (turbo)
pnpm build          # build all packages & apps
pnpm test           # run engine unit tests
pnpm db:studio      # Prisma Studio (via --filter @etl/database)
pnpm docker:down    # stop local infra
```

## Environment variables

See [`.env.example`](./.env.example). Notable: `DATABASE_URL` (control DB),
`TEMPORAL_ADDRESS`, `S3_*` (MinIO), `AI_PROVIDER`/`AI_*` (defaults to Anthropic),
`SECRETS_PROVIDER` (`env` locally, `aws` in cloud), `JWT_SECRET`.

## License

Proprietary — all rights reserved (placeholder; set as appropriate).
