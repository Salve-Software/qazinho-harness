import { accessSync, constants, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const WINDOWS_EXTENSIONS = ['.exe', '.cmd', '.bat', '.com'];

/**
 * Acha um binário do jeito que o shell da plataforma acharia, sem um processo por
 * checagem; no Windows, pela extensão.
 */
export function findOnPath(props: {
  command: string;
  directories: string[];
  platform?: NodeJS.Platform;
}): string | null {
  const platform = props.platform ?? process.platform;
  const hasExtension = WINDOWS_EXTENSIONS.includes(extname(props.command).toLowerCase());
  const names =
    platform !== 'win32'
      ? [props.command]
      : hasExtension
        ? [props.command]
        : WINDOWS_EXTENSIONS.map((extension) => `${props.command}${extension}`);

  for (const directory of props.directories)
    for (const name of names) {
      const candidate = join(directory, name);

      if (isRunnable({ path: candidate, platform })) return candidate;
    }

  return null;
}

function isRunnable(props: { path: string; platform: NodeJS.Platform }): boolean {
  try {
    if (!statSync(props.path).isFile()) return false;
    if (props.platform !== 'win32') accessSync(props.path, constants.X_OK);

    return true;
  } catch {
    return false;
  }
}
