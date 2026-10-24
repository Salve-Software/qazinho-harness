import { z } from 'zod';

/** A text the agent must give, trimmed; left out or blank, it says back `message`. */
export function textNamed(props: { message: string; description: string }) {
  return z
    .string({ error: props.message })
    .trim()
    .min(1, { error: props.message })
    .describe(props.description);
}
