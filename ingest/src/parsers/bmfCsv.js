import fs from 'node:fs';
import readline from 'node:readline';
import {
  findValue,
  mapByHeader,
  normalizeEin,
  normalizeHeaderToken,
  normalizeText,
  parseCsvLine,
  parseDate
} from './utils.js';

function looksLikeHeader(columns) {
  const normalized = columns.map(normalizeHeaderToken);
  return normalized.includes('ein') || normalized.includes('employer_identification_number');
}

export async function* parseBmfCsv(filePath, updatedAt) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let header = null;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber += 1;
    if (!line || !line.trim()) {
      continue;
    }

    const columns = parseCsvLine(line);

    if (lineNumber === 1 && looksLikeHeader(columns)) {
      header = columns.map(normalizeHeaderToken);
      continue;
    }

    const row = header ? mapByHeader(columns, header) : null;

    const ein = normalizeEin(
      row
        ? findValue(row, ['ein', 'employer_identification_number'])
        : columns[0]
    );

    if (!ein) {
      continue;
    }

    const name = normalizeText(
      row ? findValue(row, ['name', 'organization_name']) : columns[1]
    );
    const city = normalizeText(row ? findValue(row, ['city']) : columns[4]);
    const state = normalizeText(row ? findValue(row, ['state']) : columns[5]);
    const subsection = normalizeText(row ? findValue(row, ['subsection']) : columns[6]);
    const classification = normalizeText(row ? findValue(row, ['classification']) : columns[7]);
    const rulingDate = parseDate(row ? findValue(row, ['ruling_date']) : columns[8]);
    const status = normalizeText(row ? findValue(row, ['status']) : columns[9]);

    yield {
      ein,
      name,
      city,
      state,
      subsection,
      classification,
      ruling_date: rulingDate,
      status,
      updated_at: updatedAt
    };
  }
}
