import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

/** A file's size and sha256, read as a stream so a long video never sits whole in memory; null when it is gone. */
export async function fileFactsOf(
  file: string,
): Promise<{ size: number; sha256: string } | null> {
  try {
    const { size } = await stat(file);
    const hash = createHash('sha256');

    for await (const chunk of createReadStream(file)) hash.update(chunk as Buffer);

    return { size, sha256: hash.digest('hex') };
  } catch {
    return null;
  }
}
