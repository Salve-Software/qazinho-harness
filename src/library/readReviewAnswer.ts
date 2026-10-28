import type { IReviewAnswer } from '@/types';
import { REVIEW_ANSWER } from '@/schemas/REVIEW_ANSWER';

/**
 * A revisão a partir do que o agente imprimiu, conferida contra o schema; null quando não
 * é uma, ou novidade sem nada a postar. Um veredito de nada novo não guarda comentário.
 */
export function readReviewAnswer(text: string): IReviewAnswer | null {
  try {
    const read = REVIEW_ANSWER.safeParse(JSON.parse(text));

    if (!read.success) return null;

    const comment = read.data.comment.trim();

    if (read.data.verdict === 'news' && comment === '') return null;

    return {
      verdict: read.data.verdict,
      reason: read.data.reason.trim(),
      comment: read.data.verdict === 'nothing-new' ? '' : comment,
    };
  } catch {
    return null;
  }
}
