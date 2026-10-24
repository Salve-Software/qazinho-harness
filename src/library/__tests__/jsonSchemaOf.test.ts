import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { jsonSchemaOf } from '@/library';

describe('jsonSchemaOf', () => {
  it('writes the schema as JSON Schema', () => {
    expect(jsonSchemaOf(z.object({ a: z.string() }))).toEqual({
      type: 'object',
      properties: { a: { type: 'string' } },
      required: ['a'],
      additionalProperties: false,
    });
  });

  /** Claude Code ignores a --json-schema carrying "$schema", without saying so. */
  it('leaves out the "$schema" key', () => {
    expect(jsonSchemaOf(z.string())).not.toHaveProperty('$schema');
  });
});
