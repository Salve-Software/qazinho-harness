import { describe, expect, it } from 'vitest';
import { findingAnswer, stepCarryOn } from '@/engine/walk/library';

describe('stepCarryOn', () => {
  /**
   * Haiku filed the wrong total it saw as a bug, then failed the step for the same thing:
   * the QA got it twice in the run. The answer names the way to keep it one bug.
   */
  it('tells the agent to fail the step under the same title when the bug is what it expects', () => {
    expect(findingAnswer({ asked: undefined, kept: null, carryOn: stepCarryOn(2) })).toBe(
      'Filed as a bug. If it is what step 2 expects, report step 2 failed with this same title, so it stays one bug. Carry on with step 2.',
    );
  });
});
