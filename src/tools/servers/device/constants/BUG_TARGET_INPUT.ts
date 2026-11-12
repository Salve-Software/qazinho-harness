import { z } from 'zod';

export const BUG_TARGET_INPUT = z
  .string()
  .trim()
  .min(1, {
    error: '"target" is the thing on screen that is wrong, in the words it shows.',
  })
  .describe(
    'What QAzinho scrolls to and zooms in on, when the defect can be seen in one thing on the screen: a total showing the wrong value ("R$ 90"), a title with the wrong words, a button in the wrong colour. Name it the way look lists it or by the words it shows. Leave it out when no one thing shows the defect: an action had no effect, as when a saved item is not in the list; the whole screen is off, as when it is broken or tilted; or something is missing. Never point at the page title or a message to stand for the whole screen.',
  )
  .optional();
