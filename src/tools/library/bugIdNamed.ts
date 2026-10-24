import { z } from 'zod';

/** The id of a bug already open, such as "BUG-01", which the agent may leave out; anything else says back how one reads. */
export function bugIdNamed(description: string) {
  return z
    .string({ error: '"sameAs" is the id of a bug already open, such as "BUG-01".' })
    .trim()
    .toUpperCase()
    .regex(/^BUG-\d+$/, {
      error: '"sameAs" is the id of a bug already open, such as "BUG-01".',
    })
    .describe(description)
    .optional();
}
