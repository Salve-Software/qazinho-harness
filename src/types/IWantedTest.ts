import type { ISuitePlanCase } from '@/contract';

/**
 * A test the QA asks the agent to write: what it should check in the QA's words, the
 * folder to put it in, '' to follow the suite, and the plan case it automates.
 */
export interface IWantedTest {
  text: string;
  folder: string;
  source: ISuitePlanCase | null;
}
