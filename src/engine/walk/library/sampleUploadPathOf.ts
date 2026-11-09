import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sampleFileOf } from '@/engine/devices/library';

const KINDS: [RegExp, string][] = [
  [/\.(png|jpe?g|gif|webp|bmp)$/i, 'image'],
  [/\.pdf$/i, 'pdf'],
  [/\.csv$/i, 'csv'],
];

/**
 * Numa máquina sem os arquivos do QA, como a do CI: um arquivo de exemplo do mesmo tipo e
 * com o mesmo nome, para a gravação que confere o nome continuar valendo.
 */
export function sampleUploadPathOf(props: {
  folder: string;
}): (file: string) => Promise<string> {
  return async (file) => {
    const name = file.split(/[\\/]/).at(-1) ?? file;
    const kind = KINDS.find(([extension]) => extension.test(name))?.[1] ?? 'text';
    const copy = join(props.folder, name);

    await mkdir(props.folder, { recursive: true });
    await writeFile(copy, sampleFileOf(kind).bytes);

    return copy;
  };
}
