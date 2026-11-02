import { describe, expect, it } from 'vitest';
import { isLocalRequest } from '@/tools/library';

const HERE = { host: '127.0.0.1:4000', origin: undefined, port: 4000 };

describe('isLocalRequest', () => {
  it('takes a program on this machine, which sends no Origin', () => {
    expect(isLocalRequest(HERE)).toBe(true);
    expect(isLocalRequest({ ...HERE, host: 'localhost:4000' })).toBe(true);
  });

  it('refuses a page in a browser, which always names where it came from', () => {
    expect(isLocalRequest({ ...HERE, origin: 'https://evil.test' })).toBe(false);
    expect(isLocalRequest({ ...HERE, origin: 'null' })).toBe(false);
  });

  /** O rebinding de DNS: o nome do atacante resolvendo para o loopback. */
  it('refuses another name for this machine', () => {
    expect(isLocalRequest({ ...HERE, host: 'evil.test:4000' })).toBe(false);
    expect(isLocalRequest({ ...HERE, host: '127.0.0.1:5000' })).toBe(false);
    expect(isLocalRequest({ ...HERE, host: undefined })).toBe(false);
  });

  it('takes the origin of the server itself', () => {
    expect(isLocalRequest({ ...HERE, origin: 'http://127.0.0.1:4000' })).toBe(true);
  });
});
