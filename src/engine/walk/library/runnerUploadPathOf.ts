import { join } from 'node:path';
import { readFileRef } from './readFileRef';
import { sampleUploadPathOf } from './sampleUploadPathOf';

/**
 * O arquivo que uma máquina do CI sobe: o que a org guarda, pela referência ou pelo nome,
 * ou um de exemplo com o mesmo nome e tipo quando a org não tem nenhum.
 */
export function runnerUploadPathOf(props: {
  refs: string[];
  fetchFile: ((ref: string) => Promise<string | null>) | undefined;
  folder: string;
}): (file: string) => Promise<string> {
  const sample = sampleUploadPathOf({ folder: join(props.folder, 'samples') });

  return async (file) => {
    const name = file.split(/[\\/]/).at(-1) ?? file;
    const ref =
      readFileRef(file) !== null
        ? file
        : props.refs.find((one) => readFileRef(one)?.name === name);
    const fetched =
      ref === undefined || props.fetchFile === undefined
        ? null
        : await props.fetchFile(ref).catch(() => null);

    return fetched ?? sample(file);
  };
}
