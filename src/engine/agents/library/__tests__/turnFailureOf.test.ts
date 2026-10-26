import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { turnFailureOf } from '@/engine/agents';

describe('turnFailureOf', () => {
  it('says what the model’s endpoint answered', () => {
    expect(
      turnFailureOf(
        Anthropic.APIError.generate(
          529,
          { error: { type: 'overloaded_error' } },
          'overloaded',
          new Headers(),
        ),
      ),
    ).toMatch(/^The model answered 529/);
  });

  it('says the model could not be reached when nothing answered', () => {
    expect(
      turnFailureOf(new Anthropic.APIConnectionError({ message: 'offline' })),
    ).toMatch(/^The model could not be reached/);
  });

  it('says what else broke on the way', () => {
    expect(turnFailureOf(new Error('disk full'))).toBe('The agent broke off: disk full');
  });
});
