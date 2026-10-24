import type { z } from 'zod';
import { toJSONSchema } from 'zod';

/** A zod schema as the JSON Schema an agent reads, without the "$schema" key Claude Code chokes on. */
export function jsonSchemaOf(schema: z.ZodType): Record<string, unknown> {
  const { $schema: _, ...json } = toJSONSchema(schema);

  return json;
}
