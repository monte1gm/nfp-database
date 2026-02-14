# irs-ein-index

## Ingestion Job (`ingest/`)

Monthly ingestion loads IRS bulk datasets into Cloud SQL Postgres using idempotent upserts (`INSERT ... ON CONFLICT (ein) DO UPDATE`).

### What it ingests

- EO BMF extract files (CSV, configurable list)
- Pub78 bulk file (pipe-delimited, supports ZIP extraction)
- Revocations bulk file (pipe-delimited)
- 990-N bulk file (pipe-delimited)

No XML/PDF ingestion is performed.

### Local run

1. Install dependencies:

```bash
cd ingest
npm install
```

2. Set required environment variables:

```bash
export PGHOST="127.0.0.1"
export PGPORT="5432"
export PGUSER="postgres"
export PGPASSWORD="postgres"
export PGDATABASE="irs_ein_index"
```

3. Optional dataset/config overrides:

```bash
# Comma-separated BMF URLs
export BMF_URLS="https://www.irs.gov/pub/irs-soi/eo1.csv,https://www.irs.gov/pub/irs-soi/eo2.csv"

# Single-file overrides
export PUB78_URL="https://www.irs.gov/pub/irs-soi/pub78.zip"
export REVOCATIONS_URL="https://www.irs.gov/pub/irs-soi/eo_revocation.csv"
export POSTCARD_990N_URL="https://www.irs.gov/pub/irs-soi/eo_postcard.csv"

# Optional tuning
export UPSERT_BATCH_SIZE="1000"
export PGPOOL_MAX="10"
```

4. Run the pipeline:

```bash
npm start
```

### Runtime behavior

- Uses staging folders in-container: `/tmp/raw` and `/tmp/staging`
- Cleans staging folders after run (success or failure)
- Logs row counts per dataset and total duration
- Safe to re-run: upserts are idempotent by `ein`

## Cloud Run / Scheduler scripts (`infra/cloudrun/`)

- `deploy-api.sh`: builds and deploys API service to Cloud Run
- `deploy-ingest-job.sh`: builds and deploys monthly ingestion as a Cloud Run Job
- `scheduler-monthly.sh`: creates/updates a monthly Cloud Scheduler HTTP job that executes the Cloud Run Job

### Script env vars

- Common: `PROJECT_ID`, `REGION`
- API deploy: `SERVICE_NAME`, `IMAGE`
- Ingest deploy: `JOB_NAME`, `IMAGE`, `SERVICE_ACCOUNT`
- Scheduler: `JOB_NAME`, `SCHEDULER_JOB_NAME`, `SCHEDULER_REGION`, `SCHEDULE`, `TIMEZONE`, `SCHEDULER_SERVICE_ACCOUNT`
