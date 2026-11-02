import { z } from 'zod';

export const DRAFTED_CASE = z.object({
  id: z
    .string()
    .describe(
      'The id of the case this one keeps or changes, such as TC-03; none for a new case.',
    )
    .optional(),
  title: z.string(),
  priority: z.enum(['P1', 'P2', 'P3']),
  goal: z.string(),
  preconditions: z.string(),
  steps: z.array(
    z.object({
      action: z
        .string()
        .describe(
          "What to do, in the QA's words: click on a web page, tap on a phone, in the language of the plan.",
        ),
      expected: z
        .string()
        .describe(
          'What the agent will read once the action is done: what you saw on screen, or what the QA said. For a screen you have not seen, only what the QA told you, never a text, an item or a field you suppose is there. A total is the sum of the prices you saw, worked out again before you write it. What an empty screen shows says nothing about a full one: free shipping on an empty cart is not the shipping rule.',
        ),
      frame: z
        .string()
        .describe(
          "The id of the Figma node this step's screen should match, such as 12:345, from the workspace's design; none when it has no design or the step lands on no designed screen.",
        )
        .optional(),
    }),
  ),
});
