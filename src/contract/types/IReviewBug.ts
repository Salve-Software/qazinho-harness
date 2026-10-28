import type { IFiledIssue } from './IFiledIssue';
import type { IReviewSighting } from './IReviewSighting';
import type { Language } from './Language';

/**
 * Um bug aberto que as runs pegaram de novo, para o agente do QA pesar contra a issue:
 * quem pergunta, a issue, o bug como foi aberto, e cada vez que voltou.
 */
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
