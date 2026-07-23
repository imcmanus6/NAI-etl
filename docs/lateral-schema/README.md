# Lateral Schema Reference

Human-browsable reference for the **source** schemas the ETL platform reads from — the Lateral
tenant database and the Cashmere database. This is documentation, not the canonical model:
`@etl/schema-model` remains the programmatic source of truth, and `@etl/schema-discovery` is how
schemas are introspected at runtime. These files are a static snapshot for humans mapping fields.

## What's here

| File | What |
|------|------|
| [`explorer-lateral.html`](./explorer-lateral.html) | Interactive explorer — Lateral (uscollect) **reportable core** (~37 tables). Searchable; columns + types + inferred joins + reverse-lookup. |
| [`explorer-lateral-full.html`](./explorer-lateral-full.html) | Interactive explorer — Lateral **full schema** (all 398 tables, coarse domain buckets). |
| [`explorer-cashmere.html`](./explorer-cashmere.html) | Interactive explorer — Cashmere (all 57 tables). Same UI, standalone file. |
| [`schema.json`](./schema.json) | Combined machine-readable snapshot: `{ note, schemas: [{ id, label, source, tableCount, columnCount, joinCount, domains, tables: [{ name, domain, approxRows, columns: [{ name, type, nullable, key, fk }], relationships }] }] }`. A report/mapping UI can consume this directly. |
| [`dictionary-lateral.md`](./dictionary-lateral.md) | Lateral (uscollect) data dictionary — reportable core, grouped by domain. |
| [`dictionary-cashmere.md`](./dictionary-cashmere.md) | Cashmere data dictionary — all tables. |
| `generate-json.js` / `generate-explorer.js` | Regenerate the above from the extracted TSVs (see below). |

## Coverage

- **Lateral (uscollect) — core:** the ~37 reportable-core tables (cases, debtors, payments,
  arrangements, fees, transactions, clients, schemes, stages, alerts). Curated domain grouping.
- **Lateral (uscollect) — full:** all 398 tables (incl. views), grouped into coarse domain buckets
  (Financial engine, Users/roles/access, Communication, Workflow, Config/lookups/system, …). Use
  this when you need the config/system tail; use the core page for report-building day to day.
- **Cashmere:** all 57 tables.

## The one caveat

**Relationships are inferred from column-naming conventions** (`debtorid → rdebt_debtor`,
`client_id → rdebt_clients`, etc.). Neither schema declares foreign-key constraints, so the joins
are a *starting map to verify*, not a contract. The inference resolved 65 joins for Lateral and 71
for Cashmere.

## Regenerating

The generators read TSV extracts of the live schema. To refresh (MySQL on the local Docker):

```bash
# 1. extract columns + row counts per DB (repeat per schema, adjusting DB + table filter)
docker exec lat_mysql mysql -uroot -proot -N -e "
  SELECT table_name, column_name, column_type, is_nullable, column_key, IFNULL(column_comment,'')
  FROM information_schema.columns WHERE table_schema='<db>' ORDER BY table_name, ordinal_position;" \
  > <db>-columns.tsv
docker exec lat_mysql mysql -uroot -proot -N -e "
  SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='<db>';" \
  > <db>-rowcounts.tsv

# 2. rebuild json + dictionaries, then the explorer
node generate-json.js && node generate-explorer.js
```

The Lateral table selection + domain grouping + FK hints, and the Cashmere generic inference, are
configured at the top of `generate-json.js`. Longer term, this snapshot should be produced by
`@etl/schema-discovery` against the connectors rather than by hand-run SQL.
