/** One file a branch changed against its base: how, and by how many lines. */
export interface ICodeChange {
  path: string;
  status: string;
  additions: number;
  deletions: number;
}
