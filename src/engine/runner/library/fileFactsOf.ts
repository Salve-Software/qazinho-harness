import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

/**
 * O tamanho e o sha256 de um arquivo, lidos como stream para um vídeo longo nunca ficar
 * inteiro na memória; null quando ele sumiu.
 */
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
