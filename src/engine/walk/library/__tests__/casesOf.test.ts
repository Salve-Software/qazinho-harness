import { describe, expect, it } from 'vitest';
import { casesOf } from '@/engine/walk/library';

function step(caseId: string, numberInCase: number) {
  return {
    caseId,
    caseTitle: caseId,
    casePriority: 'P1',
    caseGoal: '',
    casePreconditions: '',
    numberInCase,
    action: 'act',
    expected: 'see',
  };
}

describe('casesOf', () => {
  it('groups the steps of each case, in order, keeping their place in the run', () => {
    const cases = casesOf([step('TC-01', 1), step('TC-01', 2), step('TC-02', 1)]);

    expect(
      cases.map((one) =>
        one.map(({ step: { caseId }, index }) => `${caseId}@${String(index)}`),
      ),
    ).toEqual([['TC-01@0', 'TC-01@1'], ['TC-02@2']]);
  });

  it('keeps a case that comes back later apart, so the plan order is never shuffled', () => {
    expect(casesOf([step('TC-01', 1), step('TC-02', 1), step('TC-01', 2)])).toHaveLength(
      3,
    );
  });

  it('has no case to walk in an empty plan', () => {
    expect(casesOf([])).toEqual([]);
  });
});
