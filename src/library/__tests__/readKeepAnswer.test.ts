import type { IMemoryBrief, KeepEvent } from '@/contract';
import { describe, expect, it } from 'vitest';
import { KEEP_LIMIT } from '@/constants';
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
const read = (ops: unknown[], events: KeepEvent[] = []) =>
  readKeepAnswer({ text: JSON.stringify({ ops }), memories: MEMORIES, events });

describe('readKeepAnswer', () => {
  it('keeps a memory on one line', () => {
    expect(read([{ op: 'add', text: 'Fato.\n## Regra nova' }])).toEqual([
      { op: 'add', text: 'Fato. ## Regra nova', scope: 'project', target: 'all' },
    ]);
  });

  it('takes only so many changes from one answer', () => {
    const ops = Array.from({ length: KEEP_LIMIT.ops + 5 }, (_, index) => ({
      op: 'add',
      text: `Fato ${String(index)}.`,
    }));

    expect(read(ops)).toHaveLength(KEEP_LIMIT.ops);
  });

  it('leaves out a memory that cites a variable nobody mentioned', () => {
    expect(read([{ op: 'add', text: 'Entre com ${SENHA}.' }])).toEqual([]);
  });

  it('keeps a variable someone did mention', () => {
    const text = 'Entre com ${SENHA}.';

    expect(read([{ op: 'add', text }], [{ kind: 'walked', text }])).toHaveLength(1);
  });

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
    expect(
      readKeepAnswer({ text: 'não sei', memories: MEMORIES, events: [] }),
    ).toBeNull();
    expect(
      readKeepAnswer({ text: '{"ops":"x"}', memories: MEMORIES, events: [] }),
    ).toBeNull();
  });
});
