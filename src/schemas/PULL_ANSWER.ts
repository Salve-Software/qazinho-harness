import { z } from 'zod';

const STEP = z.object({
  action: z.string().min(1).max(500).describe('What the QA does.'),
  expected: z.string().max(500).describe('What the app shows once they do it.'),
});

export const PULL_ANSWER = z.object({
  risks: z
    .array(
      z.object({
        why: z
          .string()
          .min(1)
          .max(300)
          .describe(
            'What the PR most likely breaks, in one sentence a developer reads first, such as "The total no longer adds the shipping".',
          ),
        file: z.string().max(400).describe('The file that breaks it.'),
      }),
    )
    .max(5)
    .describe(
      'What the code shows the PR most likely breaks for someone using the app; empty when it shows nothing, never a guess.',
    ),
  breaks: z
    .array(
      z.object({
        planId: z.string().describe('The plan, by its id.'),
        caseId: z.string().describe('The case, by its id.'),
        step: z.number().int().min(1).describe('The step, by its number in the case.'),
        action: STEP.shape.action.describe('The step as it will read once the PR is in.'),
        expected: STEP.shape.expected,
        why: z.string().max(400).describe('What in the PR changes it, in one sentence.'),
        file: z.string().max(400).describe('The file that changes it.'),
      }),
    )
    .max(30)
    .describe('The steps the PR changes for certain.'),
  reruns: z
    .array(
      z.object({
        planId: z.string(),
        caseId: z.string(),
        why: z.string().max(400).describe('What in it to watch, in one sentence.'),
        file: z.string().max(400),
      }),
    )
    .max(30)
    .describe(
      'The cases whose behavior the PR touches while their steps still read right.',
    ),
  newCases: z
    .array(
      z.object({
        planId: z.string().describe('The plan it belongs in.'),
        title: z.string().min(1).max(200),
        goal: z.string().max(400),
        steps: z.array(STEP).min(1).max(15),
        why: z.string().max(400),
        file: z.string().max(400),
      }),
    )
    .max(10)
    .describe('The behavior the PR adds or changes that no case covers.'),
});
