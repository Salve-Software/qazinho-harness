import type { IReviewAnswer } from '@/types';
import { REVIEW_ANSWER } from '@/schemas/REVIEW_ANSWER';

/** The review out of what the agent printed, checked against its schema; null when it is not one, or news with nothing to post. A verdict of nothing new keeps no comment. */
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
