import type { SourceCall } from './SourceCall';

/** A source tool call read against its schema: what to fetch, or what to say back to the agent. */
export type SourceToolRead =
  { kind: 'call'; call: SourceCall } | { kind: 'refused'; error: string };
