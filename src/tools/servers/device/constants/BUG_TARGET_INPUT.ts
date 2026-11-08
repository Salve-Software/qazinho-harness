import { z } from 'zod';

export const BUG_TARGET_INPUT = z
  .string()
  .trim()
  .min(1, {
    error: '"target" is the thing on screen that is wrong, in the words it shows.',
  })
  .describe(
    'The one thing on the screen that is wrong, named the way look lists it or by the words it shows, such as "Salvar": QAzinho marks it on the picture of the bug.',
  )
  .optional();
