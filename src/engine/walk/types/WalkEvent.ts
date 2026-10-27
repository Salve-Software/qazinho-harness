import type { IRunFinding, IStepOutcome } from '@/contract';

/**
 * What a walk tells its host as it goes: the step it starts, a step it settled, a bug
 * filed on the side of one, a note of the agent's, and what a case's agent spent.
 */
export type WalkEvent =
  | { kind: 'doing'; index: number; at: number }
  | { kind: 'step'; outcome: IStepOutcome }
  | { kind: 'finding'; finding: IRunFinding }
  | { kind: 'note'; text: string }
  | { kind: 'cost'; costUsd: number };
