import { describe, expect, it } from 'vitest';
import { gotoAddressOf } from '@/engine/devices/WebDriver/library/gotoAddressOf';

describe('gotoAddressOf', () => {
  it('puts a recorded path on the environment this run opened', () => {
    expect(
      gotoAddressOf({ target: '/carrinho?x=1', appUrl: 'https://pr-42.loja.dev/app' }),
    ).toBe('https://pr-42.loja.dev/carrinho?x=1');
  });

  it('leaves a whole address where it points', () => {
    expect(
      gotoAddressOf({ target: 'https://pagamentos.dev/pix', appUrl: 'https://loja.dev' }),
    ).toBe('https://pagamentos.dev/pix');
  });

  it('does not break on an app address it cannot read', () => {
    expect(gotoAddressOf({ target: '/carrinho', appUrl: 'não é url' })).toBe('/carrinho');
  });
});
