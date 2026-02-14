#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
JOB_NAME="${JOB_NAME:-irs-ein-ingest}"
SCHEDULER_JOB_NAME="${SCHEDULER_JOB_NAME:-irs-ein-ingest-monthly}"
SCHEDULER_REGION="${SCHEDULER_REGION:-us-central1}"
SCHEDULE="${SCHEDULE:-0 3 1 * *}"
TIMEZONE="${TIMEZONE:-UTC}"
SCHEDULER_SERVICE_ACCOUNT="${SCHEDULER_SERVICE_ACCOUNT:-}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required"
  exit 1
fi

if [[ -z "${SCHEDULER_SERVICE_ACCOUNT}" ]]; then
  echo "SCHEDULER_SERVICE_ACCOUNT is required"
  exit 1
fi

TARGET_URI="https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/jobs/${JOB_NAME}:run"

gcloud config set project "${PROJECT_ID}" >/dev/null

if gcloud scheduler jobs describe "${SCHEDULER_JOB_NAME}" --location "${SCHEDULER_REGION}" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "${SCHEDULER_JOB_NAME}" \
    --location "${SCHEDULER_REGION}" \
    --schedule "${SCHEDULE}" \
    --time-zone "${TIMEZONE}" \
    --uri "${TARGET_URI}" \
    --http-method POST \
    --oauth-service-account-email "${SCHEDULER_SERVICE_ACCOUNT}" \
    --oauth-token-scope "https://www.googleapis.com/auth/cloud-platform"
else
  gcloud scheduler jobs create http "${SCHEDULER_JOB_NAME}" \
    --location "${SCHEDULER_REGION}" \
    --schedule "${SCHEDULE}" \
    --time-zone "${TIMEZONE}" \
    --uri "${TARGET_URI}" \
    --http-method POST \
    --oauth-service-account-email "${SCHEDULER_SERVICE_ACCOUNT}" \
    --oauth-token-scope "https://www.googleapis.com/auth/cloud-platform"
fi

echo "Scheduler job ${SCHEDULER_JOB_NAME} set to '${SCHEDULE}' (${TIMEZONE})"
