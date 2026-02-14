import { pool } from './pg.js';

const DEFAULT_BATCH_SIZE = Number.parseInt(process.env.UPSERT_BATCH_SIZE || '1000', 10);

async function upsertBatch(table, columns, rows, batchSize = DEFAULT_BATCH_SIZE) {
  if (rows.length === 0) {
    return 0;
  }

  let processed = 0;

  for (let start = 0; start < rows.length; start += batchSize) {
    const chunk = rows.slice(start, start + batchSize);

    const values = [];
    const placeholders = [];

    for (let rowIndex = 0; rowIndex < chunk.length; rowIndex += 1) {
      const row = chunk[rowIndex];
      const rowPlaceholders = [];

      for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
        values.push(row[columns[colIndex]] ?? null);
        rowPlaceholders.push(`$${values.length}`);
      }

      placeholders.push(`(${rowPlaceholders.join(',')})`);
    }

    const updates = columns
      .filter((column) => column !== 'ein')
      .map((column) => `${column}=EXCLUDED.${column}`)
      .join(',');

    const sql = `
      INSERT INTO ${table} (${columns.join(',')})
      VALUES ${placeholders.join(',')}
      ON CONFLICT (ein) DO UPDATE SET ${updates}
    `;

    await pool.query(sql, values);
    processed += chunk.length;
  }

  return processed;
}

export async function upsertBmf(rows) {
  return upsertBatch(
    'bmf_org',
    ['ein', 'name', 'city', 'state', 'subsection', 'classification', 'ruling_date', 'status', 'updated_at'],
    rows
  );
}

export async function upsertPub78(rows) {
  return upsertBatch(
    'pub78',
    ['ein', 'name', 'city', 'state', 'deductibility_code', 'updated_at'],
    rows
  );
}

export async function upsertRevocations(rows) {
  return upsertBatch(
    'revocations',
    ['ein', 'revocation_date', 'updated_at'],
    rows
  );
}

export async function upsertEpostcard990n(rows) {
  return upsertBatch(
    'epostcard_990n',
    ['ein', 'last_990n_year', 'updated_at'],
    rows
  );
}
