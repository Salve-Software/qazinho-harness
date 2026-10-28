import type { IRunFinding, IStepOutcome } from '@/contract';

/**
 * O que um walk conta ao host enquanto anda: o passo que começa, um passo que resolveu,
 * um bug aberto ao lado de um, uma nota do agente, e o que o agente de um caso gastou.
 */
export type WalkEvent =
  | { kind: 'doing'; index: number; at: number }
  | { kind: 'step'; outcome: IStepOutcome }
  | { kind: 'finding'; finding: IRunFinding }
  | { kind: 'note'; text: string }
  | { kind: 'cost'; costUsd: number };
