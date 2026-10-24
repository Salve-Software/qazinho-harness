import type { ISuiteTestsCall } from './ISuiteTestsCall';

/** A suite tool call read against its schema: the tests to run, or what to say back to the agent. */
export type SuiteToolRead =
  { kind: 'call'; call: ISuiteTestsCall } | { kind: 'refused'; error: string };
