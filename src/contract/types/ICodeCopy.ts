import type { ICodeChange } from './ICodeChange';

/**
 * A branch's code copied for the agent to read while it plans: where it sits, the commit it is at,
 * and what it changed against the base; no base commit means the whole app, with nothing to compare.
 */
export interface ICodeCopy {
  repository: string;
  branch: string;
  base: string;
  commit: string;
  baseCommit: string | null;
  root: string;
  dir: string;
  diffFile: string | null;
  changes: ICodeChange[];
  changedFiles: number;
  commits: number;
}
