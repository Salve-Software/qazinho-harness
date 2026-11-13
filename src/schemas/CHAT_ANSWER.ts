import { z } from 'zod';
import { PLANNED_CASE } from './PLANNED_CASE';

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
  reply: z
    .string()
    .describe(
      'What you say to the QA, as a colleague would: short prose, no headings, no bold. A list only when they ask for one or there are four items or more.',
    ),
  questions: z.array(QUESTION).optional(),
  projectName: z
    .string()
    .max(60)
    .describe(
      "Only while the message says the project has no name: the app's name, the way the app or the team calls it, in a few words. Never a description of the app.",
    )
    .optional(),
  plan: z
    .object({
      summary: z.string(),
      cases: z.array(PLANNED_CASE),
      strategy: z
        .object({
          covers: z.string().describe('What the plan covers, in one sentence.'),
          leavesOut: z.string().describe('What it leaves out on purpose, and why.'),
          where: z.string().describe('Where it runs: the app, the platform, the screen.'),
          data: z.string().describe('The accounts and the data the cases need.'),
          risks: z.string().describe('The risks the cases aim at first.'),
        })
        .describe(
          'How the plan tests, on every plan, as the confirmation said it, in the language of the plan.',
        ),
    })
    .describe(
      "The plan, written the way the team's skills in the message say, when it has them.",
    )
    .optional(),
});
