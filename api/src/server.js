import express from 'express';
import { env } from './config/env.js';
import orgRouter from './routes/org.js';
import { verifyFirebaseAuth } from './middleware/verifyFirebaseAuth.js';
import { requireAllowedUser } from './middleware/requireAllowedUser.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/org', verifyFirebaseAuth, requireAllowedUser, orgRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
