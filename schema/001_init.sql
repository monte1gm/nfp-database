-- 001_init.sql
-- Base tables for IRS EIN index sources.
-- Assumptions:
-- 1) EIN is stored as exactly 9 digits (no dash), using text to preserve leading zeros.
-- 2) Each table holds the latest known state per EIN from that source feed.
-- 3) `updated_at` represents ingestion/update time in this system (UTC).

BEGIN;

CREATE TABLE IF NOT EXISTS bmf_org (
  ein text PRIMARY KEY,
  name text,
  city text,
  state text,
  subsection text,
  classification text,
  ruling_date date,
  status text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bmf_org_ein_format_chk CHECK (ein ~ '^[0-9]{9}$')
);

COMMENT ON TABLE bmf_org IS 'Business Master File (BMF) organization profile keyed by EIN.';
COMMENT ON COLUMN bmf_org.subsection IS 'IRS subsection code (e.g., 03 for 501(c)(3)).';
COMMENT ON COLUMN bmf_org.classification IS 'IRS classification code(s) from BMF.';
COMMENT ON COLUMN bmf_org.ruling_date IS 'IRS ruling date for exemption when available.';
COMMENT ON COLUMN bmf_org.status IS 'BMF status label/code for exempt organization record.';
COMMENT ON COLUMN bmf_org.updated_at IS 'Timestamp when this row was last refreshed in this database.';

CREATE TABLE IF NOT EXISTS pub78 (
  ein text PRIMARY KEY,
  name text,
  city text,
  state text,
  deductibility_code text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pub78_ein_format_chk CHECK (ein ~ '^[0-9]{9}$')
);

COMMENT ON TABLE pub78 IS 'IRS Publication 78 / Tax Exempt Organization Search eligibility source keyed by EIN.';
COMMENT ON COLUMN pub78.deductibility_code IS 'IRS deductibility code when supplied by source; non-null usually indicates contribution deductibility details.';
COMMENT ON COLUMN pub78.updated_at IS 'Timestamp when this row was last refreshed in this database.';

CREATE TABLE IF NOT EXISTS revocations (
  ein text PRIMARY KEY,
  revocation_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revocations_ein_format_chk CHECK (ein ~ '^[0-9]{9}$')
);

COMMENT ON TABLE revocations IS 'Automatic revocation list keyed by EIN.';
COMMENT ON COLUMN revocations.revocation_date IS 'Effective date of automatic revocation as provided by source.';
COMMENT ON COLUMN revocations.updated_at IS 'Timestamp when this row was last refreshed in this database.';

CREATE TABLE IF NOT EXISTS epostcard_990n (
  ein text PRIMARY KEY,
  last_990n_year integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT epostcard_990n_ein_format_chk CHECK (ein ~ '^[0-9]{9}$'),
  CONSTRAINT epostcard_990n_year_chk CHECK (
    last_990n_year IS NULL OR last_990n_year BETWEEN 1900 AND 3000
  )
);

COMMENT ON TABLE epostcard_990n IS 'Most recent Form 990-N filing year keyed by EIN.';
COMMENT ON COLUMN epostcard_990n.last_990n_year IS 'Most recent tax year with a 990-N filing in source data.';
COMMENT ON COLUMN epostcard_990n.updated_at IS 'Timestamp when this row was last refreshed in this database.';

COMMIT;
