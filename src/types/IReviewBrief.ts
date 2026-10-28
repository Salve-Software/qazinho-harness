import type { IReviewBug, ITrackerIssue, Language } from '@/contract';

/**
 * Com o que o agente pesa um bug visto de novo: a issue como o time a mantém, o bug como
 * foi aberto, cada vez que voltou, e as pastas em que estão as telas.
 */
export interface IReviewBrief {
  issue: ITrackerIssue;
  bug: IReviewBug['bug'];
  sightings: IReviewBug['sightings'];
  readDirs: string[];
  language: Language;
}
