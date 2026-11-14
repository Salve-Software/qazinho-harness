import { z } from 'zod';
import { PLANNED_CASE } from './PLANNED_CASE';

export const CHANGE_READ = z.object({
  summary: z
    .string()
    .min(1)
    .max(300)
    .describe(
      'What changed, in one sentence the QA reads first, quoting the words that changed, such as \'Criterion 3 went from "up to 3 tries" to "up to 5"\'. Never names the parts of this request, like before and after.',
    ),
  changes: z
    .array(
      z.object({
        caseId: z.string().describe('The case the change touches, by its id.'),
        why: z
          .string()
          .min(1)
          .max(300)
          .describe(
            'What in the change touches it, quoting the source, in one sentence.',
          ),
        case: PLANNED_CASE.describe(
          'The whole case as it reads once it follows the change, changing only what the change changes.',
        ),
      }),
    )
    .max(30)
    .describe('The cases whose expected results the change changes for certain.'),
  added: z
    .array(
      z.object({
        why: z.string().min(1).max(300).describe('What in the change asks for it.'),
        case: PLANNED_CASE.describe(
          "Built from the data the plan's cases already show. You do not see the app: a value no case shows is described in words, never made up.",
        ),
      }),
    )
    .max(10)
    .describe('What the change adds that no case covers.'),
  doubts: z
    .array(z.string().min(1).max(300))
    .max(5)
    .describe(
      'Questions for the team when the change contradicts another source of the plan; empty when nothing contradicts. What a question asks is never also proposed as a case or a change.',
    ),
  answered: z
    .array(
      z.object({
        doubtId: z.string().describe('The doubt, as D1.'),
        text: z
          .string()
          .min(1)
          .max(500)
          .describe('The answer, in the words of whoever gave it.'),
      }),
    )
    .max(10)
    .describe('The doubts a new comment or a meeting decision answered.'),
});
