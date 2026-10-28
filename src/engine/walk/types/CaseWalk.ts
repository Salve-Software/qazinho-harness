/**
 * Como terminou o walk de um caso para o walk em volta: resolvido, parado com a run, ou
 * quebrado pelo agente, com o porquê.
 */
export type CaseWalk =
  { kind: 'walked' } | { kind: 'stopped' } | { kind: 'failed'; reason: string };
