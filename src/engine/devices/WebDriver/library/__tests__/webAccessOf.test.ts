import { describe, expect, it } from 'vitest';
import { webAccessOf } from '@/engine/devices/WebDriver/library';

describe('webAccessOf', () => {
  it("sends Vercel's bypass for automation when the project keeps its secret", () => {
    expect(
      webAccessOf([{ name: 'VERCEL_AUTOMATION_BYPASS_SECRET', value: ' s3cret ' }]),
    ).toEqual({
      headers: {
        'x-vercel-protection-bypass': 's3cret',
        'x-vercel-set-bypass-cookie': 'true',
      },
      credentials: null,
    });
  });

  it("signs in to a browser's sign-in when the project keeps a user", () => {
    expect(
      webAccessOf([
        { name: 'BASIC_AUTH_USER', value: 'qa' },
        { name: 'BASIC_AUTH_PASSWORD', value: 'senha' },
      ]).credentials,
    ).toEqual({ username: 'qa', password: 'senha' });
  });

  it('asks for nothing when the project keeps none of them', () => {
    expect(webAccessOf([{ name: 'PASSWORD', value: 'x' }])).toEqual({
      headers: {},
      credentials: null,
    });
  });
});
