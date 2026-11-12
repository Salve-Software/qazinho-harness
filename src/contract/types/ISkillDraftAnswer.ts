import type { IChatQuestion } from './IChatQuestion';
import type { ISkillDraft } from './ISkillDraft';

/**
 * O que o agente respondeu enquanto escreve uma skill com o QA: as palavras dele, uma
 * rodada de perguntas, ou a skill pronta.
 */
export interface ISkillDraftAnswer {
  reply: string;
  questions: IChatQuestion[];
  skill: ISkillDraft | null;
}
