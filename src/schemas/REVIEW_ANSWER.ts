import { z } from 'zod';

export const REVIEW_ANSWER = z.object({
  verdict: z
    .enum(['news', 'regression', 'nothing-new'])
    .describe(
      'news: the runs show what the issue does not say yet; regression: the issue is closed and the bug came back; nothing-new: it came back the way the issue tells it.',
    ),
  reason: z.string().describe('Why, in one sentence.'),
  comment: z
    .string()
    .describe('The update to post under the issue; empty when there is nothing new.'),
});
