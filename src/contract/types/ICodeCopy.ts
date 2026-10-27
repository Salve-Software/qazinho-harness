import type { ICodeChange } from './ICodeChange';

/**
 * A branch copied for the agent to read: where it sits, its commit, and its diff against
 * the base, if any.
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
