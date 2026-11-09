import type { IStepAction } from '@/contract';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sampleFileOf } from '@/engine/devices/library';

/** Os arquivos que um upload escolhe: os do QA, que precisam existir, ou uma amostra. */
export async function uploadFilesOf(props: {
  action: IStepAction;
  folder: string;
}): Promise<string[]> {
  const { action, folder } = props;

  if (action.files === undefined) {
    const sample = sampleFileOf(action.value);
    const file = join(folder, sample.name);

    await mkdir(folder, { recursive: true });
    await writeFile(file, sample.bytes);

    return [file];
  }

  for (const file of action.files) {
    const found = await stat(file).catch(() => null);

    if (found?.isFile() !== true)
      throw new Error(
        `There is no file at ${file} on this computer. Ask the QA for its full path with ask_qa, or report the step blocked.`,
      );
  }

  return action.files;
}
