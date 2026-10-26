import { describe, expect, it } from 'vitest';
import { turnResultOf } from '@/engine/agents';

describe('turnResultOf', () => {
  it('reads what a turn cost and how it ended from the closing line', () => {
    expect(
      turnResultOf(
        JSON.stringify({
          type: 'result',
          total_cost_usd: 0.02,
          is_error: false,
          result: 'ok',
        }),
      ),
    ).toEqual({ costUsd: 0.02, isError: false, text: 'ok' });
  });

  it('reads a turn that ended in an error', () => {
    expect(
      turnResultOf(
        JSON.stringify({ type: 'result', is_error: true, result: 'Not logged in' }),
      ),
    ).toEqual({ costUsd: null, isError: true, text: 'Not logged in' });
  });

  it('reads nothing of another line, or one that is not JSON', () => {
    expect(turnResultOf(JSON.stringify({ type: 'assistant' }))).toBeNull();
    expect(turnResultOf('{"type":"res')).toBeNull();
    expect(turnResultOf('plain words')).toBeNull();
  });
});
