# Synthetic reporting data — NAI Analyst MVP

`reporting-synthetic.sql` builds a **read-only synthetic collections reporting
schema** (`reporting`) used to prove the Lateral Intelligence / NAI Analyst MVP
end-to-end without touching any real client data.

It is deterministic (`setseed(0.42)`) and creates:

| Table                     | Rows  | Notes                                                                 |
| ------------------------- | ----- | --------------------------------------------------------------------- |
| `reporting.account_current` | 1,200 | Denormalized account snapshot (status, workflow, balance, holds, etc.) |
| `reporting.payment`         | 1,461 | Payment transactions                                                   |
| `reporting.promise`         | 601   | Payment promises (due / kept)                                          |

~545 accounts match the flagship scenario: *active, balance > $2,500, no
successful contact in 14 days, no active promise, no compliance hold.* (The
count drifts by ±1 over wall-clock time because the "14 days" predicate is
relative to `now()` — exactly the dynamic-population behaviour we want to show.)

## Load it

```bash
docker cp packages/database/seeds/reporting-synthetic.sql etl-postgres:/tmp/seed.sql
docker exec etl-postgres psql -U etl -d etl_control -f /tmp/seed.sql
```

The AI never writes here — `@nai/core`'s SQL Guard allows only `SELECT`/`WITH`
against the three `reporting.*` views, and all mutations flow through the
authenticated Lateral Action API (stubbed in the MVP).
