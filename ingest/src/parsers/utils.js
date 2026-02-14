export function normalizeEin(value) {
  const ein = String(value || '').replace(/\D/g, '');
  return ein.length === 9 ? ein : null;
}

export function normalizeText(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function parseYear(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const year = Number.parseInt(normalized, 10);
  if (Number.isNaN(year) || year < 1900 || year > 3000) {
    return null;
  }

  return year;
}

export function parseDate(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const digits = normalized.replace(/\D/g, '');

  if (digits.length === 8) {
    const yyyy = digits.slice(0, 4);
    const mm = digits.slice(4, 6);
    const dd = digits.slice(6, 8);
    return `${yyyy}-${mm}-${dd}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  return null;
}

export function parseCsvLine(line) {
  const out = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      out.push(value);
      value = '';
      continue;
    }

    value += char;
  }

  out.push(value);
  return out;
}

export function mapByHeader(columns, header) {
  const row = {};
  for (let i = 0; i < header.length; i += 1) {
    row[header[i]] = columns[i] ?? '';
  }
  return row;
}

export function findValue(row, candidates) {
  for (const key of candidates) {
    if (Object.hasOwn(row, key) && String(row[key]).trim() !== '') {
      return row[key];
    }
  }
  return null;
}

export function normalizeHeaderToken(token) {
  return String(token || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
