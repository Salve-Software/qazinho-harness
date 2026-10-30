import { describe, expect, it } from 'vitest';
import { UNWALKED } from '@/engine/walk/constants';
import { unwalkedOutcome } from '@/engine/walk/library';

const STEP = {
  caseId: 'tc-1',
  caseTitle: 'Checkout',
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: '',
  numberInCase: 3,
  action: 'Pay with the saved card',
  expected: 'The order is confirmed',
};

describe('unwalkedOutcome', () => {
  it('a step the run never walked says so instead of passing, at the time it was given up', () => {
    const outcome = unwalkedOutcome({
      step: STEP,
      index: 4,
      workspaceId: 'w-1',
      verdict: 'skipped',
      why: UNWALKED.skipped,
      reason: 'skipped',
      at: 1_760_000_000_000,
    });

    expect(outcome.verdict).toBe('skipped');
    expect(outcome.why).toContain('did not hold up');
    expect(outcome.at).toBe(1_760_000_000_000);
  });

  it('a step the agent never reported is blocked, not passed', () => {
    expect(
      unwalkedOutcome({
        step: STEP,
        index: 4,
        workspaceId: 'w-1',
        verdict: 'blocked',
        why: UNWALKED.unreported,
        reason: 'unreported',
        at: 1_760_000_000_000,
      }).verdict,
    ).toBe('blocked');
  });

  it('carries the step back whole, with no screenshot, because nothing was looked at', () => {
    expect(
      unwalkedOutcome({
        step: STEP,
        index: 4,
        workspaceId: 'w-1',
        verdict: 'skipped',
        why: '',
        reason: null,
        at: 1_760_000_000_000,
      }),
    ).toMatchObject({
      workspaceId: 'w-1',
      caseId: 'tc-1',
      stepNumber: 3,
      index: 4,
      action: 'Pay with the saved card',
      expected: 'The order is confirmed',
      screenshot: null,
      shotFile: null,
    });
  });

  it('carries the code of why a step never ran, and none when the why is its own', () => {
    const outcome = (reason: 'skipped' | null) =>
      unwalkedOutcome({
        step: STEP,
        index: 4,
        workspaceId: 'w-1',
        verdict: 'skipped',
        why: 'Something else',
        reason,
        at: 1_760_000_000_000,
      });

    expect(outcome('skipped').unwalked).toBe('skipped');
    expect(outcome(null)).not.toHaveProperty('unwalked');
  });
});
