#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-irs-ein-api}"
IMAGE="${IMAGE:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required"
  exit 1
fi

gcloud config set project "${PROJECT_ID}" >/dev/null

gcloud builds submit api \
  --tag "${IMAGE}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated

echo "Deployed API service ${SERVICE_NAME} to ${REGION}"
