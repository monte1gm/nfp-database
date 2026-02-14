import { pool } from './pg.js';

export function normalizeEin(input) {
  return String(input || '').replace(/\D/g, '').slice(0, 9);
}

export async function getOrgByEin(einInput) {
  const ein = normalizeEin(einInput);
  if (ein.length !== 9) {
    return null;
  }

  const query = {
    text: 'SELECT * FROM org_master WHERE ein = $1 LIMIT 1',
    values: [ein]
  };

  const result = await pool.query(query);
  return result.rows[0] || null;
}
