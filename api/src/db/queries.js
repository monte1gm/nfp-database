import { pool } from './pool.js';

export function normalizeEin(input) {
  return String(input || '').replace(/\D/g, '').slice(0, 9);
}

export async function getOrgByEin(einInput) {
  const ein = normalizeEin(einInput);
  if (ein.length !== 9) {
    return null;
  }

  const [rows] = await pool.query(
    'SELECT * FROM orgs WHERE ein = ? LIMIT 1',
    [ein]
  );
  return rows[0] ?? null;
}
