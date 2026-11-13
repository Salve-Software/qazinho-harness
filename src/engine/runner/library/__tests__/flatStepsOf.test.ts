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

  it('marks every step of a case the QA walks by hand, and no other', () => {
    expect(
      flatStepsOf([{ ...PLAN.cases[0]!, isManual: true }, PLAN.cases[1]!]).map(
        ({ caseIsManual }) => caseIsManual === true,
      ),
    ).toEqual([true, true, true, false]);
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
