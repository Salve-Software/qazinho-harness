import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execCommand } from '@/engine/library';

/**
 * The simulator app a zipped build holds, unpacked into `folder` the way macOS keeps a
 * bundle; null when it holds none.
 */
export async function appOfZip(props: {
  zip: string;
  folder: string;
}): Promise<string | null> {
  await mkdir(props.folder, { recursive: true });
  await execCommand({ command: 'ditto', args: ['-x', '-k', props.zip, props.folder] });

  for (const name of await readdir(props.folder)) {
    if (name.endsWith('.app')) return join(props.folder, name);

    const inner = await readdir(join(props.folder, name)).catch(() => []);
    const app = inner.find((one) => one.endsWith('.app'));

    if (app !== undefined) return join(props.folder, name, app);
  }

  return null;
}
