import type { ICodeChange } from './ICodeChange';

/**
 * Uma branch copiada para o agente ler: onde ela está, o commit, e o diff contra a base,
 * se houver.
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
