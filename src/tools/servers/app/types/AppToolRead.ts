import type { AppToolCall } from '@/contract';

/** An app tool call read against its schema: the call for the page to carry out, or what to say back to the agent. */
export type AppToolRead =
  { kind: 'call'; call: AppToolCall } | { kind: 'refused'; error: string };
