import fs from 'node:fs';
import path from 'node:path';
import unzipper from 'unzipper';

export async function unzipToDir(zipPath, destinationDir) {
  await fs.promises.mkdir(destinationDir, { recursive: true });

  const directory = await unzipper.Open.file(zipPath);
  const extracted = [];

  for (const entry of directory.files) {
    if (entry.type !== 'File') {
      continue;
    }

    const outputPath = path.join(destinationDir, entry.path);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    await new Promise((resolve, reject) => {
      entry
        .stream()
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', resolve)
        .on('error', reject);
    });

    extracted.push(outputPath);
  }

  return extracted;
}
