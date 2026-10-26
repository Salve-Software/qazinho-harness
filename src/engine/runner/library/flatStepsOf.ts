import type { IFlatStep } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';

/** A plan's cases flattened into the steps a walk takes, in order, each carrying its case. */
export function flatStepsOf(cases: RunnerJob['plans'][number]['cases']): IFlatStep[] {
  return cases.flatMap((testCase) =>
    testCase.steps.map((step, index) => ({
      caseId: testCase.id,
      caseTitle: testCase.title,
      casePriority: testCase.priority,
      caseGoal: testCase.goal,
      casePreconditions: testCase.preconditions,
      numberInCase: index + 1,
      action: step.action,
      expected: step.expected,
      ...(step.frame === undefined ? {} : { frame: step.frame }),
    })),
  );
}
