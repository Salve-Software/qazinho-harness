import type { IMemoryBrief } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeMemories } from '@/context/library/describeMemories';

const MEMORY: IMemoryBrief = {
  id: 'm-1',
  text: 'Os formulários ficam em Ajustes.',
  scope: 'project',
  target: 'all',
};

describe('describeMemories', () => {
  it('says nothing when nothing was learned', () => {
    expect(describeMemories({ memories: [] })).toEqual([]);
  });

  it('lists each memory by its id and says it never decides a verdict', () => {
    const lines = describeMemories({ memories: [MEMORY] }).join('\n');

    expect(lines).toContain('- [m-1] Os formulários ficam em Ajustes.');
    expect(lines).toContain('never evidence for a verdict');
  });

  it('marks one the QA already heard in this run, and only that one', () => {
    const other = { ...MEMORY, id: 'm-2', text: 'O SSO não funciona.' };
    const lines = describeMemories({ memories: [MEMORY, other], heard: ['m-2'] });

    expect(lines).toContain('- [m-1] Os formulários ficam em Ajustes.');
    expect(lines).toContain(
      '- [m-2] O SSO não funciona. (the QA already heard this one in this run)',
    );
  });
});
