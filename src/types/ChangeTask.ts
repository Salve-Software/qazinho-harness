import type { IBrokenTest } from './IBrokenTest';
import type { IWantedTest } from './IWantedTest';

/** What the agent changing a team's suite is there to do: fix a test that broke, or write a new one. */
export type ChangeTask =
  { kind: 'fix'; broken: IBrokenTest } | { kind: 'write'; wanted: IWantedTest };
