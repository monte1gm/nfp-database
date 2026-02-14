import fs from 'node:fs';
import readline from 'node:readline';
import {
  findValue,
  mapByHeader,
  normalizeEin,
  normalizeHeaderToken,
  normalizeText
} from './utils.js';

function looksLikeHeader(columns) {
  const normalized = columns.map(normalizeHeaderToken);
  return normalized.includes('ein');
}

export async function* parsePub78Pipe(filePath, updatedAt) {
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
      name: normalizeText(row ? findValue(row, ['name', 'organization_name']) : columns[1]),
      city: normalizeText(row ? findValue(row, ['city']) : columns[2]),
      state: normalizeText(row ? findValue(row, ['state']) : columns[3]),
      deductibility_code: normalizeText(row ? findValue(row, ['deductibility_code']) : columns[4]),
      updated_at: updatedAt
    };
  }
}
