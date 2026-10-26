import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appOfZip } from '@/engine/runner/library';

describe.skipIf(process.platform !== 'darwin')('appOfZip', () => {
  it('unpacks the simulator app a build holds, a folder deep or at the top', async () => {
    const root = await mkdtemp(join(tmpdir(), 'qazinho-app-'));
    const bundle = join(root, 'Build', 'Products', 'Loja.app');

    await mkdir(bundle, { recursive: true });
    await writeFile(join(bundle, 'Info.plist'), '<plist/>');
    execFileSync('ditto', [
      '-c',
      '-k',
      '--keepParent',
      join(root, 'Build', 'Products'),
      join(root, 'build.zip'),
    ]);

    expect(
      await appOfZip({ zip: join(root, 'build.zip'), folder: join(root, 'app') }),
    ).toBe(join(root, 'app', 'Products', 'Loja.app'));
  });

  it('finds no app in a build that holds none', async () => {
    const root = await mkdtemp(join(tmpdir(), 'qazinho-app-'));

    await mkdir(join(root, 'Notes'));
    await writeFile(join(root, 'Notes', 'a.txt'), 'a');
    execFileSync('ditto', [
      '-c',
      '-k',
      '--keepParent',
      join(root, 'Notes'),
      join(root, 'notes.zip'),
    ]);

    expect(
      await appOfZip({ zip: join(root, 'notes.zip'), folder: join(root, 'out') }),
    ).toBeNull();
  });
});
