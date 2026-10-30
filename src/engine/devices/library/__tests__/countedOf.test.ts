import { describe, expect, it } from 'vitest';
import { countedOf } from '@/engine/devices/library';

describe('countedOf', () => {
  /**
   * O link do carrinho se chama "Carrinho4" com 4 itens: uma gravação feita assim não
   * achava o link num navegador limpo, onde ele se chama "Carrinho0".
   */
  it('reads a name with a counter glued to it as that name with any count', () => {
    const pattern = countedOf('Carrinho4');

    expect(pattern?.test('Carrinho0')).toBe(true);
    expect(pattern?.test('Carrinho 12')).toBe(true);
    expect(pattern?.test('Carrinho')).toBe(false);
  });

  it('reads a counter after a space the same way', () => {
    expect(countedOf('Mensagens 3')?.test('Mensagens 7')).toBe(true);
  });

  it('keeps the rest of the name exact, even a character a pattern would read', () => {
    const pattern = countedOf('Itens.novos 2');

    expect(pattern?.test('Itens.novos 5')).toBe(true);
    expect(pattern?.test('ItensXnovos 5')).toBe(false);
  });

  it('does NOT read a price, a year or a name without a number as counted', () => {
    expect(countedOf('R$ 59,90')).toBeNull();
    expect(countedOf('2026')).toBeNull();
    expect(countedOf('Entrar')).toBeNull();
  });
});
