import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sampleUploadPathOf } from '@/engine/walk/library';

const folder = () => mkdtemp(join(tmpdir(), 'qazinho-sample-path-'));

describe('sampleUploadPathOf', () => {
  it('keeps the name of the file it stands in for', async () => {
    const root = await folder();

    expect(await sampleUploadPathOf({ folder: root })('/Users/qa/lote/capa.html')).toBe(
      join(root, 'capa.html'),
    );
    expect(await sampleUploadPathOf({ folder: root })('C:\\qa\\nota.pdf')).toBe(
      join(root, 'nota.pdf'),
    );
  });

  it.each([
    { name: 'logo.PNG', starts: '\x89PNG' },
    { name: 'nota.pdf', starts: '%PDF' },
    { name: 'lista.csv', starts: 'name,email' },
    { name: 'capa.html', starts: 'A sample file' },
  ])('writes a sample of the type of $name', async ({ name, starts }) => {
    const copy = await sampleUploadPathOf({ folder: await folder() })(`/qa/${name}`);

    expect((await readFile(copy, 'latin1')).startsWith(starts)).toBe(true);
  });

  /** O agente lê uma página sob teste: nada do disco pode sair por aqui. */
  it('never reads the file it was told about, and never leaves its folder', async () => {
    const root = await folder();
    const copy = await sampleUploadPathOf({ folder: root })('/etc/../etc/passwd');

    expect(copy).toBe(join(root, 'passwd'));
    expect(await readFile(copy, 'utf8')).toBe('A sample file QAzinho uploaded.\n');
  });
});
