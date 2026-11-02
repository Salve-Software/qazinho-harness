import { describe, expect, it } from 'vitest';
import { outsideAddressOf } from '@/tools/servers/outside/library';

describe('outsideAddressOf', () => {
  it('is on this machine, with the token in the path', () => {
    expect(outsideAddressOf({ port: 4000, token: 'abc' })).toBe(
      'http://127.0.0.1:4000/abc/mcp',
    );
  });
});
