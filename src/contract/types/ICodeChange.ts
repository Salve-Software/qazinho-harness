/** Um arquivo que uma branch mudou contra a base: como, e em quantas linhas. */
export interface ICodeChange {
  path: string;
  status: string;
  additions: number;
  deletions: number;
}
