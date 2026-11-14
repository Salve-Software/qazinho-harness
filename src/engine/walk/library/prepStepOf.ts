import type { IFlatStep } from '@/contract';

/**
 * O preparo de um caso à mão como um passo só, o das pré-condições; nada quando o caso
 * não tem pré-condições.
 */
export function prepStepOf(steps: IFlatStep[]): IFlatStep | null {
  const [first] = steps;
  const preconditions = first?.casePreconditions.trim() ?? '';

  if (first === undefined || preconditions.length === 0) return null;

  return {
    caseId: first.caseId,
    caseTitle: first.caseTitle,
    casePriority: first.casePriority,
    caseGoal: first.caseGoal,
    casePreconditions: preconditions,
    numberInCase: 1,
    action: preconditions,
    expected: '',
    caseIsManual: true,
  };
}
