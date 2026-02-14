import { Router } from 'express';
import { getOrgByEin, normalizeEin } from '../db/queries.js';

const router = Router();

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
