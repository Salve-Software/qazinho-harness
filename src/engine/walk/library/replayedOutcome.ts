import type { IFlatStep, IStepOutcome } from '@/contract';
import type { IShot } from '@/engine/devices/types';
import { proofLinesOf } from './proofLinesOf';

/**
 * A step walked again without the agent: passed, since its proof showed, with each line
 * of the proof as what the screen said.
 */
export function replayedOutcome(props: {
  step: IFlatStep;
  index: number;
  workspaceId: string;
  proof: string;
  tookMs: number;
  at: number;
  shot: IShot | null;
}): IStepOutcome {
  const { step, index, workspaceId, proof, tookMs, at, shot } = props;

  return {
    workspaceId,
    caseId: step.caseId,
    stepNumber: step.numberInCase,
    index,
    action: step.action,
    expected: step.expected,
    verdict: 'passed',
    why: '',
    got: proofLinesOf(proof).join(' · '),
    title: '',
    severity: 'medium',
    tookMs,
    at,
    screenshot: shot?.dataUrl ?? null,
    shotFile: shot?.file ?? null,
    by: 'replay',
  };
}
