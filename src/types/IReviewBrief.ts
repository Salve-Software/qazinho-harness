import type { IReviewBug, ITrackerIssue, Language } from '@/contract';

/** What the agent weighs a bug seen again with: the issue as the team keeps it, the bug as first filed, each time it came back, and the folders its screens sit in. */
export interface IReviewBrief {
  issue: ITrackerIssue;
  bug: IReviewBug['bug'];
  sightings: IReviewBug['sightings'];
  readDirs: string[];
  language: Language;
}
