/**
 * Where a failure or a finding lands among the bugs: on one the job named, on one this
 * run filed already, or as a new bug.
 */
export type Landing =
  { kind: 'known'; bugId: string } | { kind: 'filed'; bugId: string } | { kind: 'new' };
