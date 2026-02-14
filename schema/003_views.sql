-- 003_views.sql
-- Consolidated EIN-level view across all source tables.
-- Assumptions for derived values:
-- 1) best-available name/city/state prefer BMF, then Pub78.
-- 2) pub78_eligible is true when a Pub78 row exists; deductibility code may provide extra detail.
-- 3) revoked is true when revocations row exists.
-- 4) updated_at is the greatest non-null updated_at timestamp across contributing sources.

BEGIN;

CREATE OR REPLACE VIEW org_master AS
WITH all_eins AS (
  SELECT ein FROM bmf_org
  UNION
  SELECT ein FROM pub78
  UNION
  SELECT ein FROM revocations
  UNION
  SELECT ein FROM epostcard_990n
)
SELECT
  e.ein,
  COALESCE(b.name, p.name) AS name,
  COALESCE(b.city, p.city) AS city,
  COALESCE(b.state, p.state) AS state,
  b.subsection,
  b.classification,
  b.status AS bmf_status,
  (
    p.ein IS NOT NULL
    OR (p.deductibility_code IS NOT NULL AND p.deductibility_code <> '')
  ) AS pub78_eligible,
  (r.ein IS NOT NULL) AS revoked,
  r.revocation_date,
  n.last_990n_year,
  jsonb_build_object(
    'bmf', (b.ein IS NOT NULL),
    'pub78', (p.ein IS NOT NULL),
    'revocations', (r.ein IS NOT NULL),
    '990n', (n.ein IS NOT NULL)
  ) AS source_flags,
  GREATEST(
    COALESCE(b.updated_at, '-infinity'::timestamptz),
    COALESCE(p.updated_at, '-infinity'::timestamptz),
    COALESCE(r.updated_at, '-infinity'::timestamptz),
    COALESCE(n.updated_at, '-infinity'::timestamptz)
  ) AS updated_at
FROM all_eins e
LEFT JOIN bmf_org b ON b.ein = e.ein
LEFT JOIN pub78 p ON p.ein = e.ein
LEFT JOIN revocations r ON r.ein = e.ein
LEFT JOIN epostcard_990n n ON n.ein = e.ein;

COMMENT ON VIEW org_master IS 'Unified EIN-level organization profile merged from BMF, Pub78, revocations, and 990-N sources.';

COMMIT;
