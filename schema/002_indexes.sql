-- 002_indexes.sql
-- Additional performance indexes.
-- Note: EIN primary keys already create unique btree indexes on each table.

BEGIN;

-- BMF lookup/filter support
CREATE INDEX IF NOT EXISTS idx_bmf_org_state ON bmf_org (state);
CREATE INDEX IF NOT EXISTS idx_bmf_org_status ON bmf_org (status);
CREATE INDEX IF NOT EXISTS idx_bmf_org_subsection ON bmf_org (subsection);
CREATE INDEX IF NOT EXISTS idx_bmf_org_updated_at ON bmf_org (updated_at DESC);

-- Pub78 lookup/filter support
CREATE INDEX IF NOT EXISTS idx_pub78_state ON pub78 (state);
CREATE INDEX IF NOT EXISTS idx_pub78_deductibility_code ON pub78 (deductibility_code);
CREATE INDEX IF NOT EXISTS idx_pub78_updated_at ON pub78 (updated_at DESC);

-- Revocation operations
CREATE INDEX IF NOT EXISTS idx_revocations_revocation_date ON revocations (revocation_date DESC);
CREATE INDEX IF NOT EXISTS idx_revocations_updated_at ON revocations (updated_at DESC);

-- 990-N operations
CREATE INDEX IF NOT EXISTS idx_epostcard_990n_last_year ON epostcard_990n (last_990n_year DESC);
CREATE INDEX IF NOT EXISTS idx_epostcard_990n_updated_at ON epostcard_990n (updated_at DESC);

COMMIT;
