import { describe, expect, it } from 'vitest';
import { privateUrlOf } from '@/engine/walk/library';

const VALUES = [
  { name: 'LOGIN_EMAIL', description: '', value: 'qa+shop@agendai.test' },
  { name: 'LOGIN_PASSWORD', description: '', value: 'Senha-123' },
];

describe('privateUrlOf', () => {
  it('keeps an ordinary address as it was', () => {
    expect(
      privateUrlOf({
        url: 'https://shop.test/api/products?page=2&sort=price',
        values: [],
      }),
    ).toBe('https://shop.test/api/products?page=2&sort=price');
  });

  it("reads a variable's value as its name, typed as is or encoded for the address", () => {
    expect(
      privateUrlOf({
        url: 'https://shop.test/api/login?email=qa%2Bshop%40agendai.test&next=Senha-123',
        values: VALUES,
      }),
    ).toBe('https://shop.test/api/login?email=${LOGIN_EMAIL}&next=${LOGIN_PASSWORD}');
  });

  it('hides the values of secret-looking keys, in the query and in the fragment', () => {
    expect(
      privateUrlOf({
        url: 'https://shop.test/cb?code=abc123&state=xyz#access_token=eyJh&expires_in=3600',
        values: [],
      }),
    ).toBe('https://shop.test/cb?code=•••&state=xyz#access_token=•••&expires_in=3600');
  });

  it('hides the password an address carries before its host', () => {
    expect(
      privateUrlOf({ url: 'https://qa:hunter22@staging.shop.test/', values: [] }),
    ).toBe('https://qa:•••@staging.shop.test/');
  });

  it('leaves an empty secret value alone, since there is nothing in it', () => {
    expect(privateUrlOf({ url: 'https://shop.test/?token=&page=1', values: [] })).toBe(
      'https://shop.test/?token=&page=1',
    );
  });
});
