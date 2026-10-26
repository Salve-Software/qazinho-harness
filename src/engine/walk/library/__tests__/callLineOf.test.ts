import { describe, expect, it } from 'vitest';
import { callLineOf } from '@/engine/walk/library';

const CALL = {
  id: 7,
  method: 'POST',
  url: 'https://shop.test/api/coupon?token=abc',
  type: 'fetch',
  status: 500,
  failure: null,
  startedAt: 1,
  durationMs: 212,
  size: 40,
  body: '{\n  "error": "Coupon service down for ana@shop.test"\n}',
};
const VALUES = [{ name: 'SHOP_EMAIL', description: '', value: 'ana@shop.test' }];

describe('callLineOf', () => {
  it('says the call, how it ended and what it answered, with its secrets and values left out', () => {
    expect(callLineOf({ call: CALL, values: VALUES, bodyChars: 300 })).toBe(
      '#7 POST https://shop.test/api/coupon?token=••• → 500 · 212 ms: {"error":"Coupon service down for ${SHOP_EMAIL}"}',
    );
  });

  it('cuts a long answer short', () => {
    expect(
      callLineOf({ call: { ...CALL, body: 'x'.repeat(50) }, values: [], bodyChars: 10 }),
    ).toMatch(/: x{10}…$/);
  });

  it('says a call that is still going, or failed with no answer', () => {
    const { body: _body, ...plain } = CALL;

    expect(
      callLineOf({
        call: { ...plain, status: null, durationMs: null },
        values: [],
        bodyChars: 300,
      }),
    ).toBe('#7 POST https://shop.test/api/coupon?token=••• → no answer yet');
    expect(
      callLineOf({
        call: { ...plain, status: null, failure: 'net::ERR_FAILED' },
        values: [],
        bodyChars: 300,
      }),
    ).toBe('#7 POST https://shop.test/api/coupon?token=••• → net::ERR_FAILED · 212 ms');
  });
});
