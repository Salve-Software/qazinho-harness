import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { modelClientOf } from '@/engine/agents';

describe('modelClientOf', () => {
  it('calls the Messages API with the body, and the signal that aborts it', async () => {
    const calls: { body: unknown; options: unknown }[] = [];
    const sdk = {
      messages: {
        create: (body: unknown, options: unknown) => {
          calls.push({ body, options });

          return Promise.resolve({ id: 'msg' });
        },
      },
    } as unknown as Anthropic;
    const signal = new AbortController().signal;

    await modelClientOf(sdk).create({
      body: { model: 'claude-haiku-5-5', max_tokens: 10, messages: [] },
      signal,
    });

    expect(calls).toEqual([
      {
        body: { model: 'claude-haiku-5-5', max_tokens: 10, messages: [] },
        options: { signal },
      },
    ]);
  });
});
