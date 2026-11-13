import { z } from 'zod';
import { DRAFTED_CASE } from './DRAFTED_CASE';

export const PLANNED_CASE = DRAFTED_CASE.extend({
  sources: z
    .array(z.string())
    .describe(
      'Where its expected results come from: a criterion of the story as C2, a Figma frame as frame 12:345, the Confluence page as page, the code as code, or the QA as qa.',
    )
    .optional(),
  blockedBy: z
    .array(z.string())
    .describe(
      'The doubts this case waits on, as D1, when the QA sent the question it depends on to the story.',
    )
    .optional(),
});
