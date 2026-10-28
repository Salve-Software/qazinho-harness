import { describe, expect, it } from 'vitest';
import { expectedValuesOf } from '@/engine/walk/library';

describe('expectedValuesOf', () => {
  it('names the prices, percentages and quoted words an expected result holds, in order', () => {
    expect(expectedValuesOf('O carrinho mostra 1 item e o total R$ 30,00')).toEqual([
      'R$ 30,00',
    ]);
    expect(
      expectedValuesOf('Aparece "Cupom inválido" e o total cai 10%, para $1,234.50'),
    ).toEqual(['Cupom inválido', '10%', '$1,234.50']);
    expect(expectedValuesOf('A mensagem “Pedido confirmado” aparece')).toEqual([
      'Pedido confirmado',
    ]);
  });

  it('keeps a price whole, NOT also the number inside it', () => {
    expect(expectedValuesOf('O total é R$ 1.234,56')).toEqual(['R$ 1.234,56']);
  });

  it('names nothing in an expected result with no value in it', () => {
    expect(expectedValuesOf('A página de pagamento abre')).toEqual([]);
    expect(expectedValuesOf("The user can't see the menu")).toEqual([]);
  });
});
