import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getOrgByEin, normalizeEin } from '../db/queries.js';

const router = Router();

router.get('/db-health', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: true, db: rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.get('/:ein', async (req, res, next) => {
  try {
    const normalizedEin = normalizeEin(req.params.ein);
    if (normalizedEin.length !== 9) {
      return res.status(400).json({ error: 'invalid_ein' });
    }

    const org = await getOrgByEin(normalizedEin);
    if (!org) {
      return res.status(404).json({ error: 'not_found' });
    }

    return res.json({ ...org });
  } catch (error) {
    return next(error);
  }
});

export default router;
