import type { IFlatStep } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';

/**
 * Os casos de um plano achatados nos passos que um walk dá, em ordem, cada um com o caso
 * e se ele é à mão.
 */
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
      ...(testCase.isManual === true ? { caseIsManual: true } : {}),
    })),
  );
}
