import { z } from 'zod';

/**
 * Um texto que o agente precisa dar, aparado; omitido ou em branco, responde `message`.
 */
export function textNamed(props: { message: string; description: string }) {
  return z
    .string({ error: props.message })
    .trim()
    .min(1, { error: props.message })
    .describe(props.description);
}
