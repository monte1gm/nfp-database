import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { withRetry } from './retry.js';

export async function downloadToFile(url, destinationPath, options = {}) {
  await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });

  await withRetry(
    async () => {
      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Download failed (${response.status}) for ${url}`);
      }

      const readStream = Readable.fromWeb(response.body);
      const writeStream = fs.createWriteStream(destinationPath);
      await pipeline(readStream, writeStream);
    },
    {
      retries: options.retries ?? 3,
      baseDelayMs: options.baseDelayMs ?? 1000
    }
  );

  return destinationPath;
}
