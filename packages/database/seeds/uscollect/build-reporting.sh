#!/usr/bin/env bash
#
# Build the read-only NAI reporting projection for the REAL Lateral `uscollect`
# database. Operational data lives in MySQL (container `nai-uscollect`); this
# projects a denormalized, per-client, read-only reporting schema into Postgres
# (`etl-postgres`, schema `uscollect`) that NAI Analyst queries — the AI never
# touches the operational store.
#
#   Operational (MySQL uscollect)  --ETL-->  reporting (Postgres uscollect.*)  --SELECT-->  NAI
#
# Prereqs:
#   - MySQL container `nai-uscollect` loaded from 2026-06-02.uscollect.sql
#     (import: strip DEFINERs, `SET sql_mode=''` handled per-query below).
#   - Postgres container `etl-postgres` (db etl_control).
#
# Run the API with NAI_REPORTING_SCHEMA=uscollect to point NAI at this data.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
MYSQL="docker exec -i nai-uscollect mysql -uroot -puscollect uscollect -N --batch"
PG="docker exec -i etl-postgres psql -U etl -d etl_control"

echo "1/3  Creating Postgres schema uscollect.* …"
$PG <<'SQL'
DROP SCHEMA IF EXISTS uscollect CASCADE;
CREATE SCHEMA uscollect;
CREATE TABLE uscollect.account_current (
  account_id integer PRIMARY KEY, client_id integer, client_name text,
  collector_id integer, collector_name text, team text,
  status text, workflow text, account_type text, jurisdiction text,
  opened_at timestamptz, last_activity_at timestamptz,
  last_contact_at timestamptz, last_successful_contact_at timestamptz,
  current_balance numeric, placed_balance numeric,
  has_compliance_hold boolean, has_active_promise boolean,
  has_active_arrangement boolean, is_locked boolean);
CREATE INDEX ON uscollect.account_current (status);
CREATE INDEX ON uscollect.account_current (current_balance);
CREATE INDEX ON uscollect.account_current (client_id);
CREATE TABLE uscollect.payment (
  payment_id integer PRIMARY KEY, account_id integer, amount numeric,
  paid_at timestamptz, method text, status text, net_amount numeric);
CREATE INDEX ON uscollect.payment (account_id);
CREATE TABLE uscollect.promise (
  promise_id integer PRIMARY KEY, account_id integer, amount numeric,
  active boolean, is_settlement boolean, first_due_at timestamptz,
  last_due_at timestamptz, status text);
CREATE INDEX ON uscollect.promise (account_id);
SQL

echo "2/3  Extracting from MySQL and loading …"
$MYSQL < "$HERE/01_extract_account.sql" | $PG -c "\copy uscollect.account_current (account_id,client_id,client_name,collector_id,collector_name,team,status,workflow,account_type,jurisdiction,opened_at,last_activity_at,last_contact_at,last_successful_contact_at,current_balance,placed_balance,has_compliance_hold,has_active_promise,has_active_arrangement,is_locked) FROM STDIN WITH (FORMAT csv, DELIMITER E'\t', NULL 'NULL')"
$MYSQL < "$HERE/02_extract_payment.sql" | $PG -c "\copy uscollect.payment (payment_id,account_id,amount,paid_at,method,status) FROM STDIN WITH (FORMAT csv, DELIMITER E'\t', NULL 'NULL')"
$MYSQL < "$HERE/03_extract_promise.sql" | $PG -c "\copy uscollect.promise (promise_id,account_id,amount,active,is_settlement,first_due_at,last_due_at) FROM STDIN WITH (FORMAT csv, DELIMITER E'\t', NULL 'NULL')"

echo "3/3  Shaping to the NAI catalog contract …"
$PG <<'SQL'
-- status = normalized active/closed flag the catalog filters on; workflow = the
-- rich Lateral status name (nice breakdowns).
UPDATE uscollect.account_current
SET workflow = status,
    status = CASE WHEN workflow = 'Active' THEN 'active' ELSE 'closed' END;
UPDATE uscollect.payment SET net_amount = amount;
-- this dump has no kept/broken tracking, so promise_kept_rate stays null.
UPDATE uscollect.promise SET status = CASE WHEN active THEN 'pending' ELSE 'closed' END;
SQL

echo "Done. Portfolio:"
$PG -c "SELECT status, count(*), sum(current_balance)::numeric(14,2) AS balance FROM uscollect.account_current GROUP BY status ORDER BY 2 DESC;"
