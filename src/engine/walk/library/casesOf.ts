import type { IFlatStep } from '@/contract';

/**
 * O plano achatado cortado de volta nos casos, cada passo mantendo o lugar na run
 * inteira.
 */
export function casesOf(steps: IFlatStep[]): { step: IFlatStep; index: number }[][] {
  const cases: { step: IFlatStep; index: number }[][] = [];

  for (const [index, step] of steps.entries()) {
    const last = cases.at(-1);

    if (last?.[0]?.step.caseId === step.caseId) last.push({ step, index });
    else cases.push([{ step, index }]);
  }

  return cases;
}
