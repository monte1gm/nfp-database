import express from 'express';
import { env } from './config/env.js';
import orgRouter from './routes/org.js';
import { verifyFirebaseAuth } from './middleware/verifyFirebaseAuth.js';
import { requireAllowedUser } from './middleware/requireAllowedUser.js';
import { pool } from './db/pool.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/db-health', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: true, db: rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/org', verifyFirebaseAuth, requireAllowedUser, orgRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
