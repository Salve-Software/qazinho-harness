import type { ICaseRecipe, IFlatStep } from '@/contract';
import { describe, expect, it } from 'vitest';
import { bookWithPrep, fingerprintOf, prepFor, prepStepOf } from '@/engine/walk/library';

const STEP: IFlatStep = {
  caseId: 'TC-07',
  caseTitle: 'The invoice PDF reads well',
  casePriority: 'P2',
  caseGoal: '',
  casePreconditions: ' Signed in, on order 1042 ',
  numberInCase: 1,
  action: 'Download the invoice',
  expected: 'A PDF downloads',
  caseIsManual: true,
};

const prepOf = (step: IFlatStep, runId = 'r-01'): ICaseRecipe => ({
  caseId: step.caseId,
  fingerprint: fingerprintOf({ targetKind: 'web', steps: [step] }),
  targetKind: 'web',
  steps: [{ number: 1, actions: [], proof: 'Order 1042' }],
  runId,
  recordedAt: 0,
});

describe('the preparation of a case walked by hand', () => {
  it('is one step, its preconditions', () => {
    expect(prepStepOf([STEP])).toMatchObject({
      caseId: 'TC-07',
      numberInCase: 1,
      action: 'Signed in, on order 1042',
      expected: '',
    });
  });

  it('is nothing for a case with no preconditions', () => {
    expect(prepStepOf([{ ...STEP, casePreconditions: ' ' }])).toBeNull();
    expect(prepStepOf([])).toBeNull();
  });

  it('is found again while the preconditions say the same, and lost once they change', () => {
    const step = prepStepOf([STEP])!;
    const book = bookWithPrep({ book: { cases: [] }, prep: prepOf(step) });

    expect(prepFor({ book, step, targetKind: 'web' })?.runId).toBe('r-01');
    expect(
      prepFor({
        book,
        step: prepStepOf([{ ...STEP, casePreconditions: 'On order 1043' }])!,
        targetKind: 'web',
      }),
    ).toBeNull();
    expect(prepFor({ book, step, targetKind: 'android' })).toBeNull();
  });

  it('takes the place of the one the case had, and leaves the recordings alone', () => {
    const step = prepStepOf([STEP])!;
    const recorded: ICaseRecipe = { ...prepOf(step), caseId: 'TC-01' };
    const book = bookWithPrep({
      book: { cases: [recorded], preps: [prepOf(step, 'old')] },
      prep: prepOf(step, 'new'),
    });

    expect(book.cases).toEqual([recorded]);
    expect(book.preps?.map(({ runId }) => runId)).toEqual(['new']);
  });
});
