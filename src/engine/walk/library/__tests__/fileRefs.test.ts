import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  fileRefOf,
  fileRefsIn,
  readFileRef,
  runnerUploadPathOf,
} from '@/engine/walk/library';

const SHA = 'a'.repeat(64);
const REF = fileRefOf({ sha256: SHA, name: 'capa.html' });
const folder = () => mkdtemp(join(tmpdir(), 'qazinho-file-ref-'));

describe('readFileRef', () => {
  it('reads what fileRefOf wrote', () => {
    expect(readFileRef(REF)).toEqual({ sha256: SHA, name: 'capa.html' });
  });

  it('reads no path of a machine', () => {
    expect(readFileRef('/Users/qa/capa.html')).toBeNull();
    expect(readFileRef(`${SHA}/sub/capa.html`)).toBeNull();
  });
});

describe('fileRefsIn', () => {
  it('lists each file a recording picks once, and no path', () => {
    const steps = [
      {
        number: 1,
        proof: 'x',
        actions: [
          { kind: 'upload' as const, target: 'A', value: '', files: [REF, '/qa/b.png'] },
          { kind: 'click' as const, target: 'B', value: '' },
        ],
      },
    ];

    expect(fileRefsIn([{ steps }, { steps }])).toEqual([REF]);
  });
});

describe('runnerUploadPathOf', () => {
  it('picks the copy the org keeps', async () => {
    const path = runnerUploadPathOf({
      refs: [REF],
      fetchFile: (ref) => Promise.resolve(`/work/${ref}`),
      folder: await folder(),
    });

    expect(await path(REF)).toBe(`/work/${REF}`);
  });

  /** O passo fala do caminho de quem gravou, e o agente repete esse caminho no CI. */
  it('finds the copy by name when the agent gives the path of another machine', async () => {
    const path = runnerUploadPathOf({
      refs: [REF],
      fetchFile: (ref) => Promise.resolve(`/work/${ref}`),
      folder: await folder(),
    });

    expect(await path('/Users/quem-gravou/capa.html')).toBe(`/work/${REF}`);
  });

  it('falls back to a sample of the same name when the org has none', async () => {
    const root = await folder();
    const copy = await runnerUploadPathOf({
      refs: [REF],
      fetchFile: () => Promise.resolve(null),
      folder: root,
    })(REF);

    expect(copy).toBe(join(root, 'samples', 'capa.html'));
    expect(await readFile(copy, 'utf8')).toContain('sample file');
  });

  it('falls back to a sample when the download breaks', async () => {
    const root = await folder();

    expect(
      await runnerUploadPathOf({
        refs: [REF],
        fetchFile: () => Promise.reject(new Error('down')),
        folder: root,
      })(REF),
    ).toBe(join(root, 'samples', 'capa.html'));
  });
});
