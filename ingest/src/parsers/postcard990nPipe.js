import fs from 'node:fs';
import readline from 'node:readline';
import {
  findValue,
  mapByHeader,
  normalizeEin,
  normalizeHeaderToken,
  parseYear
} from './utils.js';

function looksLikeHeader(columns) {
  const normalized = columns.map(normalizeHeaderToken);
  return normalized.includes('ein');
}

export async function* parsePostcard990nPipe(filePath, updatedAt) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let header = null;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber += 1;
    if (!line || !line.trim()) {
      continue;
    }

    const columns = line.split('|');

    if (lineNumber === 1 && looksLikeHeader(columns)) {
      header = columns.map(normalizeHeaderToken);
      continue;
    }

    const row = header ? mapByHeader(columns, header) : null;

    const ein = normalizeEin(row ? findValue(row, ['ein']) : columns[0]);
    if (!ein) {
      continue;
    }

    yield {
      ein,
      last_990n_year: parseYear(row ? findValue(row, ['last_990n_year', 'tax_period']) : columns[1]),
      updated_at: updatedAt
    };
  }
}
