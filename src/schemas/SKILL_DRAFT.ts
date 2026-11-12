import { z } from 'zod';

const QUESTION = z.object({
  header: z.string(),
  question: z.string(),
  options: z
    .array(z.object({ label: z.string(), description: z.string() }))
    .min(1)
    .max(4),
  multiSelect: z.boolean(),
});

export const SKILL_DRAFT = z.object({
  reply: z
    .string()
    .describe(
      'What you say to the QA, as a colleague would: short prose, no headings, no bold.',
    ),
  questions: z.array(QUESTION).max(3).optional(),
  skill: z
    .object({
      name: z
        .string()
        .describe(
          "Lowercase words joined by hyphens, in the QA's language, such as cases-gherkin.",
        ),
      description: z
        .string()
        .describe(
          'When to use it, in one or two sentences, such as "When writing the cases of a plan from a story".',
        ),
      body: z
        .string()
        .describe(
          'The instructions in Markdown: short and direct, one ## section per subject.',
        ),
    })
    .describe('The whole skill, filled only once nothing the skill depends on is open.')
    .optional(),
});
