function toInt(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 8080),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  pg: {
    host: process.env.PGHOST || '127.0.0.1',
    user: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || '',
    port: toInt(process.env.PGPORT, 5432),
    max: toInt(process.env.PGPOOL_MAX, 10),
    idleTimeoutMillis: toInt(process.env.PG_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: toInt(process.env.PG_CONN_TIMEOUT_MS, 10000)
  }
};
