import { describe, expect, it } from 'vitest';
import { relativeGoto } from '@/engine/walk/library/relativeGoto';

const APP = 'https://staging.loja.dev/app';

describe('relativeGoto', () => {
  it('keeps only the path of an address of the app itself', () => {
    expect(
      relativeGoto({ target: 'https://staging.loja.dev/carrinho?x=1#a', appUrl: APP }),
    ).toBe('/carrinho?x=1#a');
  });

  it('leaves the address of another site as it is', () => {
    expect(relativeGoto({ target: 'https://pagamentos.dev/pix', appUrl: APP })).toBe(
      'https://pagamentos.dev/pix',
    );
  });

  it('counts another port as another site', () => {
    expect(
      relativeGoto({
        target: 'http://localhost:3001/a',
        appUrl: 'http://localhost:3000',
      }),
    ).toBe('http://localhost:3001/a');
  });

  it('leaves what is not an address, such as a path already or a deep link', () => {
    expect(relativeGoto({ target: '/carrinho', appUrl: APP })).toBe('/carrinho');
    expect(relativeGoto({ target: 'loja://pedido', appUrl: '/tmp/loja.apk' })).toBe(
      'loja://pedido',
    );
  });
});
