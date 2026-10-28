import type { ReviewVerdict } from '@/contract';

/**
 * O que o agente concluiu de um bug visto de novo: o veredito, o porquê, e o comentário
 * que escreveu.
 */
export interface IReviewAnswer {
  verdict: ReviewVerdict;
  reason: string;
  comment: string;
}
