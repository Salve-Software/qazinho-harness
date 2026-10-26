import { describe, expect, it } from 'vitest';
import { SECRET_PARAMS } from '@/engine/walk/constants';

const isSecret = (key: string) =>
  SECRET_PARAMS.anywhere.test(key) || SECRET_PARAMS.whole.test(key);

describe('SECRET_PARAMS', () => {
  it.each([
    'access_token',
    'apiKey',
    'api-key',
    'password',
    'sessionId',
    'Authorization',
  ])('reads %s as a secret wherever it sits in the key', (key) => {
    expect(isSecret(key)).toBe(true);
  });

  it.each(['key', 'code', 'sig'])(
    'reads %s as a secret when it is the whole key',
    (key) => {
      expect(isSecret(key)).toBe(true);
    },
  );

  it.each(['page', 'zipcode', 'monkey', 'q', 'sort'])(
    'does NOT hide %s, an ordinary key',
    (key) => {
      expect(isSecret(key)).toBe(false);
    },
  );
});
