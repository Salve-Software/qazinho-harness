import type { IStepAction } from '@/contract';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { uploadFilesOf } from '@/engine/devices/WebDriver/library';

const upload = (over: Partial<IStepAction>): IStepAction => ({
  kind: 'upload',
  target: 'Foto',
  value: 'image',
  ...over,
});
const folder = () => mkdtemp(join(tmpdir(), 'qazinho-upload-'));

describe('uploadFilesOf', () => {
  it('writes a sample of the kind asked', async () => {
    const [file] = await uploadFilesOf({ action: upload({}), folder: await folder() });

    expect(file).toMatch(/qazinho-sample\.png$/);
    expect((await readFile(file ?? '')).length).toBeGreaterThan(0);
  });

  it("hands over the QA's own files as they are, and writes no sample", async () => {
    const root = await folder();
    const file = join(root, 'nota.pdf');

    await writeFile(file, 'pdf');

    expect(
      await uploadFilesOf({ action: upload({ files: [file] }), folder: join(root, 'x') }),
    ).toEqual([file]);
  });

  it('says in words that a file is not there', async () => {
    const root = await folder();
    const file = join(root, 'sumiu.pdf');

    await expect(
      uploadFilesOf({ action: upload({ files: [file] }), folder: root }),
    ).rejects.toThrow(`There is no file at ${file} on this computer.`);
  });

  it('refuses a folder in place of a file', async () => {
    const root = await folder();

    await expect(
      uploadFilesOf({ action: upload({ files: [root] }), folder: root }),
    ).rejects.toThrow('There is no file at');
  });
});
