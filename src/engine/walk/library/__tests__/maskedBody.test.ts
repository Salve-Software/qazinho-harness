import { describe, expect, it } from 'vitest';
import { maskedBody } from '@/engine/walk/library';

describe('maskedBody', () => {
  it('hides the values of secret-looking keys in JSON, however deep, and keeps the rest', () => {
    expect(
      JSON.parse(
        maskedBody(
          JSON.stringify({
            error: 'Coupon expired',
            user: { email: 'ana@shop.test', accessToken: 'abc123', session_id: 9 },
            items: [{ password: 'x' }],
          }),
        ),
      ),
    ).toEqual({
      error: 'Coupon expired',
      user: { email: 'ana@shop.test', accessToken: '•••', session_id: '•••' },
      items: [{ password: '•••' }],
    });
  });

  it('hides a token in any string, and keys in plain text', () => {
    expect(
      maskedBody(
        JSON.stringify({ note: 'Bearer eyJhbGciOiJI.eyJzdWIiOiIx.c2lnbmF0dXJl' }),
      ),
    ).toBe('{"note":"Bearer •••"}');
    expect(maskedBody('error=bad_coupon&token=abc123 api_key: k-999')).toBe(
      'error=bad_coupon&token=••• api_key: •••',
    );
  });

  it('leaves an answer with nothing secret as it was', () => {
    expect(maskedBody('<h1>500 Internal Server Error</h1>')).toBe(
      '<h1>500 Internal Server Error</h1>',
    );
  });
});
