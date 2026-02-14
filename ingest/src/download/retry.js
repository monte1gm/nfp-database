function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(fn, options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : 3;
  const baseDelayMs = Number.isInteger(options.baseDelayMs) ? options.baseDelayMs : 1000;

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) {
        throw lastError;
      }
      const delay = baseDelayMs * attempt;
      await sleep(delay);
    }
  }

  throw lastError;
}
