import { posix, win32 } from 'node:path';

const DEEPER_NAME = /^(?:[\\/]|\.)?[\p{L}\p{N}_-]/u;
const PATH_BEFORE = /[\p{L}\p{N}_.\\/-]$/u;
const HOME_MENTION = /(^|[\s"'`(])~(?=[\\/])/g;

/**
 * Quais arquivos do QA uma run pode subir: o que o plano nomeia, o que está direto numa
 * pasta que ele nomeia, e o que está numa das pastas de anexos.
 */
export function uploadRuleOf(props: {
  texts: string[];
  folders: string[];
  home: string;
  platform: NodeJS.Platform;
}): (file: string) => boolean {
  const paths = props.platform === 'win32' ? win32 : posix;
  const said = props.texts
    .join('\n')
    .replace(HOME_MENTION, (_whole, before: string) => `${before}${props.home}`);

  return (file) => {
    if (!paths.isAbsolute(file) || paths.normalize(file) !== file) return false;

    const folder = paths.dirname(file);

    return (
      props.folders.includes(folder) ||
      isNamed({ said, path: file }) ||
      (!paths.basename(file).startsWith('.') && isNamed({ said, path: folder }))
    );
  };
}

function isNamed(props: { said: string; path: string }): boolean {
  const { said, path } = props;

  for (let at = said.indexOf(path); at !== -1; at = said.indexOf(path, at + 1)) {
    const isWhole =
      !PATH_BEFORE.test(said.slice(0, at)) &&
      !DEEPER_NAME.test(said.slice(at + path.length));

    if (isWhole) return true;
  }

  return false;
}
