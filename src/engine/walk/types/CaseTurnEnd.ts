/**
 * Como terminou o turno de um agente num caso: por conta própria, sem o que a run pode
 * gastar no modelo, ou quebrado, com o porquê.
 */
export type CaseTurnEnd =
  | { kind: 'ended'; costUsd: number | null }
  | { kind: 'capped'; costUsd: number | null }
  | { kind: 'failed'; reason: string; costUsd: number | null };
