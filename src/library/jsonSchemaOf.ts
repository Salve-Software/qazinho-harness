import type { z } from 'zod';
import { toJSONSchema } from 'zod';

/**
 * Um schema zod como o JSON Schema que um agente lê, sem a chave "$schema" em que o
 * Claude Code engasga.
 */
export function jsonSchemaOf(schema: z.ZodType): Record<string, unknown> {
  const { $schema: _, ...json } = toJSONSchema(schema);

  return json;
}
