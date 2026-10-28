import { z } from 'zod';

/**
 * O id de um bug já aberto, como "BUG-01", que o agente pode omitir; qualquer outra coisa
 * responde como um se lê.
 */
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
