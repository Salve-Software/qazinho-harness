import { describe, expect, it } from 'vitest';
import { describeReferences } from '@/context/library';

describe('describeReferences', () => {
  it('lists each thing the QA pointed at with its facts under it', () => {
    expect(
      describeReferences([
        {
          kind: 'run',
          id: 'r-02',
          title: 'The whole plan',
          facts: ['6 passed', '2 blocked'],
        },
        { kind: 'bug', id: 'BUG-01', title: 'Cart empties', facts: ['severity high'] },
      ]).lines,
    ).toEqual([
      'run r-02 · The whole plan',
      '  6 passed',
      '  2 blocked',
      'bug BUG-01 · Cart empties',
      '  severity high',
    ]);
  });

  it('has nothing to say when the QA pointed at nothing', () => {
    expect(describeReferences([]).lines).toEqual([]);
  });
});
