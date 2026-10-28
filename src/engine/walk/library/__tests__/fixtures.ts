import type { IFlatStep } from '@/contract';

/** Um caso de dois passos, como a página o achata para uma run. */
export const STEPS: IFlatStep[] = [
  {
    caseId: 'TC-01',
    caseTitle: 'Save a visit',
    casePriority: 'P1',
    caseGoal: 'A saved visit counts',
    casePreconditions: '',
    numberInCase: 1,
    action: 'Tap Save visit',
    expected: 'Visits: 1',
  },
  {
    caseId: 'TC-01',
    caseTitle: 'Save a visit',
    casePriority: 'P1',
    caseGoal: 'A saved visit counts',
    casePreconditions: '',
    numberInCase: 2,
    action: 'Close the app completely and open it again',
    expected: 'Still Visits: 1',
  },
];
