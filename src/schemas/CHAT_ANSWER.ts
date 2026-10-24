import { z } from 'zod';
import { DRAFTED_CASE } from './DRAFTED_CASE';

const VARIABLE = z.object({
  name: z
    .string()
    .describe('The variable, in capitals with _ between words, such as LOGIN_EMAIL.'),
  description: z
    .string()
    .describe(
      'What it holds, for whoever picks it later, such as "The admin\'s email on staging".',
    ),
});

const OPTION = z.object({
  label: z.string(),
  description: z.string(),
  variables: z
    .array(VARIABLE)
    .describe(
      'Only on the option that creates variables: picking it opens a window where the QA types their values, which you never see.',
    )
    .optional(),
});

const QUESTION = z.object({
  header: z.string(),
  question: z.string(),
  options: z.array(OPTION).min(1).max(4),
  multiSelect: z.boolean(),
});

export const CHAT_ANSWER = z.object({
  reply: z.string(),
  questions: z.array(QUESTION).optional(),
  plan: z.object({ summary: z.string(), cases: z.array(DRAFTED_CASE) }).optional(),
});
