import { describe, expect, it } from 'vitest';
import { describePlan } from '@/context/library';

describe('describePlan', () => {
  it('groups the steps under their case, numbered as the QA sees them', () => {
    expect(
      describePlan([
        {
          caseId: 'TC-01',
          caseTitle: 'Sign in',
          casePriority: 'P1',
          caseGoal: '',
          casePreconditions: '',
          numberInCase: 1,
          action: 'Open',
          expected: 'Form',
        },
        {
          caseId: 'TC-01',
          caseTitle: 'Sign in',
          casePriority: 'P1',
          caseGoal: '',
          casePreconditions: '',
          numberInCase: 2,
          action: 'Submit',
          expected: 'Home',
        },
        {
          caseId: 'TC-02',
          caseTitle: 'Cart',
          casePriority: 'P1',
          caseGoal: '',
          casePreconditions: '',
          numberInCase: 1,
          action: 'Add',
          expected: 'Badge 1',
        },
      ]),
    ).toEqual([
      'The plan the workspace holds right now:',
      'TC-01 · Sign in · P1',
      '  1. Open → Form',
      '  2. Submit → Home',
      'TC-02 · Cart · P1',
      '  1. Add → Badge 1',
    ]);
  });

  it('writes out the goal and preconditions of a case, so a change to the plan keeps them', () => {
    expect(
      describePlan([
        {
          caseId: 'TC-01',
          caseTitle: 'Sign in',
          casePriority: 'P2',
          caseGoal: 'A member gets in.',
          casePreconditions: 'Account qa@shop.test, password Test-1234.',
          numberInCase: 1,
          action: 'Sign in',
          expected: 'Home',
        },
      ]),
    ).toEqual([
      'The plan the workspace holds right now:',
      'TC-01 · Sign in · P2',
      '  Goal: A member gets in.',
      '  Preconditions: Account qa@shop.test, password Test-1234.',
      '  1. Sign in → Home',
    ]);
  });

  it('says there is no plan instead of an empty list', () => {
    expect(describePlan([])).toEqual(['The workspace has no plan yet.']);
  });
});
