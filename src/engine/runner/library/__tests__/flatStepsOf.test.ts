import { describe, expect, it } from 'vitest';
import { flatStepsOf } from '@/engine/runner/library';
import { PLAN } from './fixtures';

describe('flatStepsOf', () => {
  it('flattens every case into its steps, in order, each numbered within its case', () => {
    expect(
      flatStepsOf(PLAN.cases).map(({ caseId, numberInCase, action }) => [
        caseId,
        numberInCase,
        action,
      ]),
    ).toEqual([
      ['pix', 1, 'Open the cart'],
      ['pix', 2, 'Pay with Pix'],
      ['pix', 3, 'Copy the code'],
      ['coupon', 1, 'Apply OFF10'],
    ]);
  });

  it('carries the case a step belongs to, and the Figma frame it names', () => {
    const [step] = flatStepsOf([
      {
        ...PLAN.cases[0]!,
        steps: [{ action: 'Open the cart', expected: 'One item', frame: '12:34' }],
      },
    ]);

    expect(step).toMatchObject({
      caseTitle: 'Pay with Pix',
      casePreconditions: 'An item in the cart',
      frame: '12:34',
    });
  });
});
