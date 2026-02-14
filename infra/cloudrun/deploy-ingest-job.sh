#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
JOB_NAME="${JOB_NAME:-irs-ein-ingest}"
IMAGE="${IMAGE:-gcr.io/${PROJECT_ID}/${JOB_NAME}:latest}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required"
  exit 1
fi

if [[ -z "${SERVICE_ACCOUNT}" ]]; then
  echo "SERVICE_ACCOUNT is required for Cloud Run Job"
  exit 1
fi

gcloud config set project "${PROJECT_ID}" >/dev/null

gcloud builds submit ingest \
  --tag "${IMAGE}"

gcloud run jobs deploy "${JOB_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --service-account "${SERVICE_ACCOUNT}" \
  --max-retries 1 \
  --tasks 1

echo "Deployed ingest job ${JOB_NAME} to ${REGION}"
