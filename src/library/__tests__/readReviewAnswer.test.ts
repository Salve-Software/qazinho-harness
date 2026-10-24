import { describe, expect, it } from 'vitest';
import { readReviewAnswer } from '@/library';

describe('readReviewAnswer', () => {
  it('reads the verdict, why and the comment, trimmed', () => {
    expect(
      readReviewAnswer(
        JSON.stringify({
          verdict: 'news',
          reason: ' On mobile too. ',
          comment: ' It also breaks at 390 × 844. ',
        }),
      ),
    ).toEqual({
      verdict: 'news',
      reason: 'On mobile too.',
      comment: 'It also breaks at 390 × 844.',
    });
  });

  it('keeps no comment when nothing is new', () => {
    expect(
      readReviewAnswer(
        JSON.stringify({ verdict: 'nothing-new', reason: 'Same.', comment: 'x' }),
      ),
    ).toEqual({ verdict: 'nothing-new', reason: 'Same.', comment: '' });
  });

  it('reads a regression with no more to say than that it is back', () => {
    expect(
      readReviewAnswer(
        JSON.stringify({ verdict: 'regression', reason: 'Back.', comment: ' ' }),
      ),
    ).toEqual({ verdict: 'regression', reason: 'Back.', comment: '' });
  });

  it('does NOT read news with nothing to post, prose, or another verdict', () => {
    expect(
      readReviewAnswer(JSON.stringify({ verdict: 'news', reason: 'New.', comment: ' ' })),
    ).toBeNull();
    expect(readReviewAnswer('The bug is back.')).toBeNull();
    expect(
      readReviewAnswer(JSON.stringify({ verdict: 'maybe', reason: '', comment: '' })),
    ).toBeNull();
  });
});
