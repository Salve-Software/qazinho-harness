import type { IStepOutcome } from '@/contract';
import type { IWalkLog, RunnerJob } from '@/engine/runner/types';
import { flatStepsOf } from '@/engine/runner/library';

/** Um plano de dois casos: pagar com Pix em três passos, e um cupom em um. */
export const PLAN: RunnerJob['plans'][number] = {
  id: 'plan-1',
  name: 'Checkout',
  version: 3,
  cases: [
    {
      id: 'pix',
      title: 'Pay with Pix',
      priority: 'P1',
      goal: 'A paid order',
      preconditions: 'An item in the cart',
      steps: [
        { action: 'Open the cart', expected: 'The cart shows 1 item' },
        { action: 'Pay with Pix', expected: 'The Pix code shows' },
        { action: 'Copy the code', expected: 'Code copied' },
      ],
    },
    {
      id: 'coupon',
      title: 'Apply a coupon',
      priority: 'P2',
      goal: '',
      preconditions: '',
      steps: [{ action: 'Apply OFF10', expected: 'The total drops 10%' }],
    },
  ],
};

export const STEPS = flatStepsOf(PLAN.cases);

export const outcomeOf = (
  props: Partial<IStepOutcome> & { index: number },
): IStepOutcome => {
  const step = STEPS[props.index];

  return {
    workspaceId: 'plan-1',
    caseId: step?.caseId ?? '',
    stepNumber: step?.numberInCase ?? 0,
    action: step?.action ?? '',
    expected: step?.expected ?? '',
    verdict: 'passed',
    why: '',
    got: '',
    title: '',
    severity: 'medium',
    tookMs: 1_000,
    at: 1_760_000_010_000 + props.index * 10_000,
    screenshot: null,
    shotFile: `/runs/r1/step-${String(props.index + 1)}.jpg`,
    ...props,
  };
};

/** Um walk em que o código Pix nunca apareceu, e o cupom nunca foi alcançado. */
export const LOG: IWalkLog = {
  outcomes: [
    outcomeOf({ index: 0 }),
    outcomeOf({
      index: 1,
      verdict: 'failed',
      why: 'No Pix code',
      got: 'A spinner',
      title: 'Pix code never shows',
      severity: 'high',
    }),
    outcomeOf({
      index: 2,
      verdict: 'skipped',
      why: 'Skipped because the step before it did not hold up.',
      shotFile: null,
    }),
  ],
  began: new Map([
    [0, 1_760_000_005_000],
    [1, 1_760_000_012_000],
  ]),
  findings: [],
  startedAt: 1_760_000_000_000,
  endedAt: 1_760_000_042_000,
};
