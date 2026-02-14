import { Pool } from 'pg';
import { env } from '../config/env.js';

export const pool = new Pool({
  host: env.pg.host,
  user: env.pg.user,
  password: env.pg.password,
  database: env.pg.database,
  port: env.pg.port,
  max: env.pg.max,
  idleTimeoutMillis: env.pg.idleTimeoutMillis,
  connectionTimeoutMillis: env.pg.connectionTimeoutMillis
});

pool.on('error', (error) => {
  console.error('Unexpected Postgres pool error', error);
});
