import { describe, expect, it } from 'vitest';
import { networkJsonOf } from '@/engine/runner/library';

describe('networkJsonOf', () => {
  it('keeps each request with a variable’s value read back as its name, and a token as dots', () => {
    const json = networkJsonOf({
      entries: [
        {
          id: 1,
          method: 'POST',
          url: 'https://loja.test/api/login?user=ana%40loja.test&token=abc123',
          type: 'fetch',
          status: 401,
          failure: null,
          startedAt: 1,
          durationMs: 80,
          size: 20,
          body: '{"error":"bad password for ana@loja.test","access_token":"zzz999"}',
        },
      ],
      values: [{ name: 'USER', description: '', value: 'ana@loja.test' }],
    });

    expect(json).toContain('${USER}');
    expect(json).not.toContain('ana@loja.test');
    expect(json).not.toContain('abc123');
    expect(json).not.toContain('zzz999');
  });
});
