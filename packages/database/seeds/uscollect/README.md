# uscollect — real Lateral reporting edition

Projects the **real Lateral `uscollect` database** (a MySQL 8 dump from AWS RDS)
into a read-only NAI reporting schema so Lateral Intelligence answers over real
data instead of the synthetic demo.

```
Operational              ETL (build-reporting.sh)      Reporting (read-only)        NAI Analyst
MySQL: nai-uscollect  ───────────────────────────▶  Postgres: uscollect.*  ──SELECT──▶  Ask → Act
(rdebt_* / financial_*)                              (account_current/payment/promise)
```

The AI never touches the operational MySQL. It only sees the Postgres projection,
through the SQL Guard (`SELECT`-only, allow-listed to `uscollect.*`). Point the API
at it with **`NAI_REPORTING_SCHEMA=uscollect`** (see `@nai/core`'s `schema.ts`).

## Load

1. Stand up the operational DB (once):
   ```bash
   docker run -d --name nai-uscollect -e MYSQL_ROOT_PASSWORD=uscollect \
     -e MYSQL_DATABASE=uscollect -p 127.0.0.1:33063:3306 mysql:8.0 --max_allowed_packet=1G
   # strip DEFINERs while importing the dump:
   sed -E 's/DEFINER=`[^`]+`@`[^`]+`//g' 2026-06-02.uscollect.sql \
     | docker exec -i nai-uscollect mysql -uroot -puscollect --force uscollect
   ```
2. Build the reporting projection:
   ```bash
   ./build-reporting.sh
   ```

> The `.sql` dump is **real production data (debtor PII + financials)** — never
> commit it, and keep it local. Only the schema-mapping queries live here.

## Field mapping (rdebt_cases → account_current)

| Reporting column        | Source                                             | Notes |
| ----------------------- | -------------------------------------------------- | ----- |
| `account_id`            | `rdebt_cases.id`                                   | a case = an account |
| `client_id`             | `rdebt_cases.client_id`                            | 5 clients in this dump |
| `client_name`           | `'Client '‖client_id`                              | `rdebt_clients` table empty in dump |
| `status`                | `status_type=1 → 'active'` else `'closed'`         | drives the certified metrics |
| `workflow`              | `rdebt_case_status.status_name`                    | rich label (New Account, Message One…) |
| `current_balance`       | `d_clientbalance`                                  | live outstanding ($53.97M total) |
| `placed_balance`        | `amount1`                                          | original assigned |
| `opened_at`             | `date`                                             | 2015–2023 |
| `last_activity_at`      | `last_activity_date`                               | populated for all rows |
| `has_active_arrangement`/`has_active_promise` | active row in `rdebt_arrangements` | 20 accounts |
| `has_compliance_hold`   | `holdcount > 0`                                    | not populated → all false |
| payment `net_amount`    | `rdebt_payment.amount`                             | 3,232 payments |
| promise `status`        | `active → 'pending'` else `'closed'`               | see caveat |

## Honest caveats (this dump is partially populated)

`rdebt_clients`, `rdebt_compliance_links`, and `rdebt_case_contact_attempts` are
empty, so:

- **`last_successful_contact_at` is NULL** — the "no contact in N days" filter has
  no backing data (last *activity* is available; last *successful contact* is not).
- **`has_compliance_hold` is all false** — no compliance-hold data in this extract.
- **`promise_kept_rate` is null** — arrangements carry no kept/broken outcome here.
- **collector / team dimensions are NULL** — not present in the dump.

Real portfolio (as loaded): 55,111 accounts · 11,432 active · $9.30M active
outstanding · $53.97M total · $476,658 net collections.
