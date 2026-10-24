import { describe, expect, it } from 'vitest';
import { CHAT_SCHEMA } from '@/schemas';

describe('CHAT_SCHEMA', () => {
  it('asks for a reply, and lets the questions and the plan be left out', () => {
    const schema = JSON.parse(CHAT_SCHEMA) as { required: string[]; properties: object };

    expect(schema.required).toEqual(['reply']);
    expect(Object.keys(schema.properties)).toEqual(['reply', 'questions', 'plan']);
  });

  it('asks a question with one to four options to pick, the way Claude Code asks its own', () => {
    const schema = JSON.parse(CHAT_SCHEMA) as {
      properties: { questions: { items: { required: string[]; properties: object } } };
    };
    const question = schema.properties.questions.items;

    expect(question.required).toEqual(['header', 'question', 'options', 'multiSelect']);
    expect(question.properties).toMatchObject({ options: { minItems: 1, maxItems: 4 } });
  });

  /**
   * Claude Code drops a --json-schema that carries "$schema" without a word: it stops offering
   * the StructuredOutput tool, and the agent answers in prose. z.toJSONSchema writes it, so it
   * has to be taken out.
   */
  it('carries no "$schema", which makes the CLI ignore the schema', () => {
    expect(JSON.parse(CHAT_SCHEMA)).not.toHaveProperty('$schema');
  });

  it('refuses fields the answer never asked for, so the agent cannot drift', () => {
    expect(JSON.parse(CHAT_SCHEMA)).toMatchObject({ additionalProperties: false });
  });
});
