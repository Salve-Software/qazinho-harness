import { z } from 'zod';

export const BUG_CATEGORY_INPUT = z
  .enum(['layout', 'text', 'style', 'behavior', 'data', 'error'], {
    error: '"category" is layout, text, style, behavior, data or error.',
  })
  .describe(
    'What kind of bug it is, shown to the QA as the moment it is caught: layout (size, position, spacing), text (wrong or missing words), style (colour, font, border, corners), behavior (something did not do what it should), data (a wrong value, total or list) or error (an error on screen or a call that failed).',
  )
  .optional();
