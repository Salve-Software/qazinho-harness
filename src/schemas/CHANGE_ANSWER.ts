import { z } from 'zod';

export const CHANGE_ANSWER = z.object({
  outcome: z
    .enum(['changed', 'app-bug', 'gave-up'])
    .describe(
      'changed: the test passes with what you changed; app-bug: the app is wrong and you changed nothing; gave-up: you could not get there.',
    ),
  summary: z
    .string()
    .describe(
      'What was wrong and what you did, or why it is the app, for the QA to read.',
    ),
  commit: z
    .string()
    .describe('The commit message for your change; empty when you changed nothing.'),
  title: z.string().describe("The pull request's title; empty when you changed nothing."),
  body: z
    .string()
    .describe(
      "The pull request's description in Markdown: what broke, why, and what changed; empty when you changed nothing.",
    ),
});
