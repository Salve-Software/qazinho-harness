import { describe, expect, it } from 'vitest';
import { recipeBookOf } from '@/engine/runner/library';

const recording = (planId: string, steps: unknown[]) => ({
  planId,
  caseId: 'pix',
  fingerprint: 'fp',
  targetKind: 'web' as const,
  steps,
  recordedAt: '2026-10-24T10:00:00.000Z',
});

const STEP = {
  number: 1,
  actions: [{ kind: 'click', target: 'Cart', value: '' }],
  proof: 'Cart',
};

describe('recipeBookOf', () => {
  it('reads the recordings of one plan as a walk walks them again', () => {
    expect(
      recipeBookOf({
        recordings: [recording('plan-1', [STEP]), recording('plan-2', [STEP])],
        planId: 'plan-1',
      }),
    ).toEqual({
      cases: [
        {
          caseId: 'pix',
          fingerprint: 'fp',
          targetKind: 'web',
          steps: [STEP],
          runId: '',
          recordedAt: Date.parse('2026-10-24T10:00:00.000Z'),
        },
      ],
    });
  });

  it('leaves out a recording whose steps do not read as one', () => {
    expect(
      recipeBookOf({
        recordings: [recording('plan-1', [{ number: 1, actions: 'click' }])],
        planId: 'plan-1',
      }).cases,
    ).toEqual([]);
  });
});
