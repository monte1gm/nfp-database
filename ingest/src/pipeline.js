import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { getDatasets } from './config/datasets.js';
import { downloadToFile } from './download/index.js';
import { unzipToDir } from './extract/unzip.js';
import {
  parseBmfCsv,
  parsePub78Pipe,
  parseRevocationsPipe,
  parsePostcard990nPipe
} from './parsers/index.js';
import {
  upsertBmf,
  upsertPub78,
  upsertRevocations,
  upsertEpostcard990n
} from './db/upserts.js';
import { pool } from './db/pg.js';

const RAW_DIR = '/tmp/raw';
const STAGING_DIR = '/tmp/staging';

async function resetDirs() {
  await fs.promises.rm(RAW_DIR, { recursive: true, force: true });
  await fs.promises.rm(STAGING_DIR, { recursive: true, force: true });
  await fs.promises.mkdir(RAW_DIR, { recursive: true });
  await fs.promises.mkdir(STAGING_DIR, { recursive: true });
}

async function cleanupDirs() {
  await fs.promises.rm(RAW_DIR, { recursive: true, force: true });
  await fs.promises.rm(STAGING_DIR, { recursive: true, force: true });
}

function fileNameFromUrl(url, fallbackName) {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    return base || fallbackName;
  } catch {
    return fallbackName;
  }
}

async function collectRows(asyncIterable, upsertFn, chunkSize = 2000) {
  let rows = [];
  let count = 0;

  for await (const row of asyncIterable) {
    rows.push(row);
    if (rows.length >= chunkSize) {
      count += await upsertFn(rows);
      rows = [];
    }
  }

  if (rows.length > 0) {
    count += await upsertFn(rows);
  }

  return count;
}

async function runBmf(dataset, updatedAt) {
  let total = 0;

  for (let i = 0; i < dataset.urls.length; i += 1) {
    const url = dataset.urls[i];
    const rawName = fileNameFromUrl(url, `bmf-${i + 1}.csv`);
    const rawPath = path.join(RAW_DIR, rawName);

    console.log(`[bmf] downloading ${url}`);
    await downloadToFile(url, rawPath, { retries: 4, baseDelayMs: 1500 });

    const parsedRows = parseBmfCsv(rawPath, updatedAt);
    const count = await collectRows(parsedRows, upsertBmf);
    total += count;

    console.log(`[bmf] upserted ${count} rows from ${rawName}`);
  }

  return total;
}

async function resolveSourceFiles(dataset, updatedAtTag) {
  const rawName = fileNameFromUrl(dataset.url, `${dataset.name}.dat`);
  const rawPath = path.join(RAW_DIR, rawName);

  console.log(`[${dataset.name}] downloading ${dataset.url}`);
  await downloadToFile(dataset.url, rawPath, { retries: 4, baseDelayMs: 1500 });

  if (!dataset.zipped) {
    return [rawPath];
  }

  const extractDir = path.join(STAGING_DIR, `${dataset.name}-${updatedAtTag}`);
  const extracted = await unzipToDir(rawPath, extractDir);

  if (extracted.length === 0) {
    throw new Error(`[${dataset.name}] zip extraction produced no files`);
  }

  return extracted;
}

function pickPrimaryFile(files) {
  if (files.length === 1) {
    return files[0];
  }

  const preferred = files.find((file) => /\.(txt|csv|dat)$/i.test(file));
  return preferred || files[0];
}

async function runPub78(dataset, updatedAt, updatedAtTag) {
  const files = await resolveSourceFiles(dataset, updatedAtTag);
  const source = pickPrimaryFile(files);
  const rows = parsePub78Pipe(source, updatedAt);
  const count = await collectRows(rows, upsertPub78);
  console.log(`[pub78] upserted ${count} rows`);
  return count;
}

async function runRevocations(dataset, updatedAt, updatedAtTag) {
  const files = await resolveSourceFiles(dataset, updatedAtTag);
  const source = pickPrimaryFile(files);
  const rows = parseRevocationsPipe(source, updatedAt);
  const count = await collectRows(rows, upsertRevocations);
  console.log(`[revocations] upserted ${count} rows`);
  return count;
}

async function runEpostcard(dataset, updatedAt, updatedAtTag) {
  const files = await resolveSourceFiles(dataset, updatedAtTag);
  const source = pickPrimaryFile(files);
  const rows = parsePostcard990nPipe(source, updatedAt);
  const count = await collectRows(rows, upsertEpostcard990n);
  console.log(`[epostcard_990n] upserted ${count} rows`);
  return count;
}

async function main() {
  const start = performance.now();
  const updatedAt = new Date().toISOString();
  const updatedAtTag = updatedAt.replace(/[^0-9]/g, '').slice(0, 14);

  console.log('[pipeline] starting monthly ingest run');
  await resetDirs();

  const datasets = getDatasets();
  const counts = {
    bmf: 0,
    pub78: 0,
    revocations: 0,
    epostcard_990n: 0
  };

  try {
    counts.bmf = await runBmf(datasets.bmf, updatedAt);
    counts.pub78 = await runPub78(datasets.pub78, updatedAt, updatedAtTag);
    counts.revocations = await runRevocations(datasets.revocations, updatedAt, updatedAtTag);
    counts.epostcard_990n = await runEpostcard(datasets.epostcard990n, updatedAt, updatedAtTag);

    const durationSec = ((performance.now() - start) / 1000).toFixed(2);
    const totalRows = counts.bmf + counts.pub78 + counts.revocations + counts.epostcard_990n;

    console.log(`[pipeline] counts: ${JSON.stringify(counts)}`);
    console.log(`[pipeline] total rows upserted: ${totalRows}`);
    console.log(`[pipeline] duration_sec: ${durationSec}`);
  } finally {
    await cleanupDirs();
    await pool.end();
    console.log('[pipeline] cleaned temporary folders and closed database pool');
  }
}

main().catch((error) => {
  console.error('[pipeline] failed', error);
  process.exitCode = 1;
});
