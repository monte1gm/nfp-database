import { Pool } from 'pg';

function toInt(value, fallback) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  user: process.env.PGUSER || '',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || '',
  port: toInt(process.env.PGPORT, 5432),
  max: toInt(process.env.PGPOOL_MAX, 10),
  idleTimeoutMillis: toInt(process.env.PG_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: toInt(process.env.PG_CONN_TIMEOUT_MS, 10000)
});

pool.on('error', (error) => {
  console.error('Unexpected Postgres pool error', error);
});
