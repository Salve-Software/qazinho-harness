/**
 * How an agent's turn on a case ended: on its own, out of what the run may spend on the
 * model, or broken, with why.
 */
export type CaseTurnEnd =
  | { kind: 'ended'; costUsd: number | null }
  | { kind: 'capped'; costUsd: number | null }
  | { kind: 'failed'; reason: string; costUsd: number | null };
