import type { IChatQuestionOption } from './IChatQuestionOption';

/** A question the agent puts to the QA: a few options to pick, and room for the QA's own words. */
export interface IChatQuestion {
  header: string;
  question: string;
  options: IChatQuestionOption[];
  isMultiSelect: boolean;
}
