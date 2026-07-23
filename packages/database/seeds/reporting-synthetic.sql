-- Synthetic collections reporting DB for NAI Analyst (demo only).
-- A denormalised reporting.account_current drives the population/worklist flow;
-- reporting.payment + reporting.promise back a few metrics.
DROP SCHEMA IF EXISTS reporting CASCADE;
CREATE SCHEMA reporting;
SELECT setseed(0.42);

CREATE TABLE reporting.account_current AS
SELECT
  a AS account_id,
  cid AS client_id,
  (ARRAY['Northwind','Acme Health','Oriel','Colliers'])[cid] AS client_name,
  colid AS collector_id,
  'Collector ' || colid AS collector_name,
  (ARRAY['US','West','East'])[1 + (colid % 3)] AS team,
  CASE WHEN r1 < 0.85 THEN 'active' ELSE 'closed' END AS status,
  (ARRAY['New Business','Early Resolution','Legal','Payment Plan','Skip Trace'])[1 + floor(r2*5)::int] AS workflow,
  (ARRAY['Medical','Commercial','Consumer'])[1 + floor(r3*3)::int] AS account_type,
  (ARRAY['NY','TX','CA','FL'])[1 + floor(r4*4)::int] AS jurisdiction,
  (now() - (r5*730 || ' days')::interval)::timestamptz AS opened_at,
  (now() - (r6*40  || ' days')::interval)::timestamptz AS last_activity_at,
  (now() - (r7*60  || ' days')::interval)::timestamptz AS last_contact_at,
  (now() - ((10 + r8*90) || ' days')::interval)::timestamptz AS last_successful_contact_at,
  round((r9 * 10000)::numeric, 2) AS current_balance,
  round(((r9 * 10000) + r10 * 2000)::numeric, 2) AS placed_balance,
  (r11 < 0.05) AS has_compliance_hold,
  (r12 < 0.20) AS has_active_promise,
  (r13 < 0.10) AS has_active_arrangement,
  (r14 < 0.03) AS is_locked
FROM (
  SELECT a,
    1 + floor(random()*4)::int  AS cid,
    1 + floor(random()*12)::int AS colid,
    random() AS r1, random() AS r2, random() AS r3, random() AS r4, random() AS r5,
    random() AS r6, random() AS r7, random() AS r8, random() AS r9, random() AS r10,
    random() AS r11, random() AS r12, random() AS r13, random() AS r14
  FROM generate_series(1, 1200) a
) s;

ALTER TABLE reporting.account_current ADD PRIMARY KEY (account_id);
CREATE INDEX ON reporting.account_current (status);
CREATE INDEX ON reporting.account_current (current_balance);
CREATE INDEX ON reporting.account_current (collector_id);

-- Payments (last 60 days), for collections metrics.
CREATE TABLE reporting.payment AS
SELECT
  row_number() OVER () AS payment_id,
  ac.account_id, ac.client_id, ac.collector_id,
  (now() - (random()*60 || ' days')::interval)::timestamptz AS payment_date,
  round((50 + random()*900)::numeric, 2) AS amount,
  round((50 + random()*900)::numeric, 2) AS net_amount,
  'CG' AS type
FROM reporting.account_current ac, generate_series(1, 3) g
WHERE random() < 0.4;
CREATE INDEX ON reporting.payment (payment_date);

-- Promises, for promise-kept metrics.
CREATE TABLE reporting.promise AS
SELECT
  row_number() OVER () AS promise_id,
  ac.account_id, ac.collector_id,
  (now() - (random()*45 || ' days')::interval)::timestamptz AS created_at,
  (now() - (random()*20 - 5 || ' days')::interval)::timestamptz AS due_date,
  round((100 + random()*1500)::numeric, 2) AS amount,
  (ARRAY['kept','broken','open'])[1 + floor(random()*3)::int] AS status,
  2 AS grace_days
FROM reporting.account_current ac
WHERE random() < 0.5;

-- Read-only role the analyst service uses (SELECT only on reporting).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nai_readonly') THEN
    CREATE ROLE nai_readonly NOLOGIN;
  END IF;
END $$;
GRANT USAGE ON SCHEMA reporting TO nai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO nai_readonly;

SELECT 'accounts' AS t, count(*) FROM reporting.account_current
UNION ALL SELECT 'payments', count(*) FROM reporting.payment
UNION ALL SELECT 'promises', count(*) FROM reporting.promise
UNION ALL SELECT 'scenario_match',
  count(*) FROM reporting.account_current
  WHERE status='active' AND current_balance > 2500
    AND last_successful_contact_at < now() - interval '14 days'
    AND NOT has_active_promise AND NOT has_compliance_hold;
