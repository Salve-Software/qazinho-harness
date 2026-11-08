import { z } from 'zod';

export const KEEP_ANSWER = z.object({
  ops: z
    .array(
      z.object({
        op: z
          .enum(['add', 'replace', 'delete'])
          .describe(
            'add: a new subject; replace: different or more on the subject of a memory; delete: the QA said to forget one.',
          ),
        id: z
          .string()
          .nullish()
          .describe('For replace and delete: the id of the memory, as it is listed.'),
        scope: z
          .enum(['project', 'plan'])
          .nullish()
          .describe(
            'For add: project when it would still hold in another plan, plan when it only holds for this one.',
          ),
        target: z
          .enum(['all', 'web', 'android', 'ios'])
          .nullish()
          .describe(
            'For add: all, or the one kind of target it holds for. For replace: only when that changes.',
          ),
        text: z
          .string()
          .nullish()
          .describe(
            'For add and replace: the memory, one short fact an agent understands alone.',
          ),
      }),
    )
    .describe('What changes in what QAzinho keeps; empty when nothing does.'),
});
