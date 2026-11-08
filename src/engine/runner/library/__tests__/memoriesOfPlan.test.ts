import { describe, expect, it } from 'vitest';
import { MEMORIES_SHOWN } from '@/engine/runner/constants';
import { memoriesOfPlan } from '@/engine/runner/library';

const memory = (id: string, planId: string | null) => ({
  planId,
  id,
  text: `fato ${id}`,
  scope: planId === null ? ('project' as const) : ('plan' as const),
  target: 'all' as const,
});

describe('memoriesOfPlan', () => {
  it('takes what holds for the project and for this plan, and no other plan', () => {
    expect(
      memoriesOfPlan({
        memories: [memory('a', null), memory('b', 'p-1'), memory('c', 'p-2')],
        planId: 'p-1',
      }).map(({ id }) => id),
    ).toEqual(['a', 'b']);
  });

  it('keeps only the most recent ones', () => {
    const many = Array.from({ length: MEMORIES_SHOWN + 2 }, (_, i) =>
      memory(`m${String(i)}`, null),
    );
    const shown = memoriesOfPlan({ memories: many, planId: 'p-1' });

    expect(shown).toHaveLength(MEMORIES_SHOWN);
    expect(shown.at(-1)?.id).toBe(`m${String(MEMORIES_SHOWN + 1)}`);
  });
});
