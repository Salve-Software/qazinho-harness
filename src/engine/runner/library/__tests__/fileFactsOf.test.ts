import { createHash } from 'node:crypto';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileFactsOf } from '@/engine/runner/library';

describe('fileFactsOf', () => {
  it('reads a file’s size and sha256', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'qazinho-facts-')), 'a.jpg');

    await writeFile(file, 'jpeg');

    expect(await fileFactsOf(file)).toEqual({
      size: 4,
      sha256: createHash('sha256').update('jpeg').digest('hex'),
    });
  });

  it('reads nothing of a file that is gone', async () => {
    expect(await fileFactsOf('/nowhere/a.jpg')).toBeNull();
  });
});
