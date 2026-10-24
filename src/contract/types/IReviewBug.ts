import type { IFiledIssue } from './IFiledIssue';
import type { IReviewSighting } from './IReviewSighting';
import type { Language } from './Language';

/** A filed bug the runs caught again, for the QA's agent to weigh against its issue: who asks, the issue, the bug as first filed, and each time it came back. */
export interface IReviewBug {
  workspaceId: string;
  bugId: string;
  agentId: string;
  model: string;
  language: Language;
  issue: IFiledIssue;
  bug: { title: string; expected: string; got: string; body: string; caseTitle: string };
  sightings: IReviewSighting[];
}
