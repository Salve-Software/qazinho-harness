/** How one case's walk ended for the walk around it: settled, stopped with the run, or broken by its agent, with why. */
export type CaseWalk =
  { kind: 'walked' } | { kind: 'stopped' } | { kind: 'failed'; reason: string };
