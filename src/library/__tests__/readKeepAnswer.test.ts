import type { IMemoryBrief } from '@/contract';
import { describe, expect, it } from 'vitest';
import { MEMORY_LIMIT } from '@/contract';
import { readKeepAnswer } from '@/library/readKeepAnswer';

const MEMORIES: IMemoryBrief[] = [
  {
    id: 'm-1',
    text: 'Os formulários ficam em Ajustes.',
    scope: 'project',
    target: 'all',
  },
];
const read = (ops: unknown[]) =>
  readKeepAnswer({ text: JSON.stringify({ ops }), memories: MEMORIES });

describe('readKeepAnswer', () => {
  it('keeps a memory at the size limit and leaves out a longer one', () => {
    const atLimit = 'x'.repeat(MEMORY_LIMIT.chars);

    expect(read([{ op: 'add', text: atLimit }])).toEqual([
      { op: 'add', text: atLimit, scope: 'project', target: 'all' },
    ]);
    expect(read([{ op: 'add', text: `${atLimit}x` }])).toEqual([]);
    expect(read([{ op: 'replace', id: 'm-1', text: `${atLimit}x` }])).toEqual([]);
  });

  it('reads a new memory, defaulting to the whole project and every target', () => {
    expect(read([{ op: 'add', text: ' O SSO não funciona. ' }])).toEqual([
      { op: 'add', text: 'O SSO não funciona.', scope: 'project', target: 'all' },
    ]);
  });

  it('keeps the scope and target the agent chose', () => {
    expect(
      read([
        { op: 'add', text: 'Biometria no login.', scope: 'plan', target: 'android' },
      ]),
    ).toEqual([
      { op: 'add', text: 'Biometria no login.', scope: 'plan', target: 'android' },
    ]);
  });

  it('reads the nulls a strict schema sends for what does not apply', () => {
    expect(
      read([{ op: 'delete', id: 'm-1', scope: null, target: null, text: null }]),
    ).toEqual([{ op: 'delete', id: 'm-1' }]);
    expect(
      read([
        { op: 'replace', id: 'm-1', text: 'Em Relatórios.', scope: null, target: null },
      ]),
    ).toEqual([{ op: 'replace', id: 'm-1', text: 'Em Relatórios.' }]);
  });

  it('leaves out a change to a memory the agent never read', () => {
    expect(read([{ op: 'replace', id: 'm-9', text: 'Outra coisa.' }])).toEqual([]);
    expect(read([{ op: 'delete', id: 'm-9' }])).toEqual([]);
  });

  it('leaves out a memory with nothing in it', () => {
    expect(read([{ op: 'add', text: '   ' }])).toEqual([]);
    expect(read([{ op: 'replace', id: 'm-1', text: '' }])).toEqual([]);
  });

  it('takes one change per memory, the first the agent gave', () => {
    expect(
      read([
        { op: 'replace', id: 'm-1', text: 'Em Relatórios.' },
        { op: 'delete', id: 'm-1' },
      ]),
    ).toEqual([{ op: 'replace', id: 'm-1', text: 'Em Relatórios.' }]);
  });

  it('answers an empty list when nothing changes', () => {
    expect(read([])).toEqual([]);
  });

  it('is null when the agent answered something else', () => {
    expect(readKeepAnswer({ text: 'não sei', memories: MEMORIES })).toBeNull();
    expect(readKeepAnswer({ text: '{"ops":"x"}', memories: MEMORIES })).toBeNull();
  });
});
