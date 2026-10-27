import type { IDraftedCase } from '@/contract';

/**
 * How an exploration ended, in the explorer's words: what it explored and how it went,
 * and the cases it suggests a plan holds.
 */
export interface IExploreFinish {
  summary: string;
  cases: IDraftedCase[];
}
