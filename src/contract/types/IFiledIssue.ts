import type { IssueTracker } from './IssueTracker';

/**
 * A issue que um bug virou no tracker do QA: a chave lá, a página, e quando foi aberta.
 */
export interface IFiledIssue {
  tracker: IssueTracker;
  key: string;
  url: string;
  at: string;
}
