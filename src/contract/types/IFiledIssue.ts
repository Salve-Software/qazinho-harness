import type { IssueTracker } from './IssueTracker';

/** The issue a bug became in the QA's tracker: its key there, its page, and when it was filed. */
export interface IFiledIssue {
  tracker: IssueTracker;
  key: string;
  url: string;
  at: string;
}
