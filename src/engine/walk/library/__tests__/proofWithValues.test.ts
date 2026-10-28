import { describe, expect, it } from 'vitest';
import { proofWithValues } from '@/engine/walk/library';

const SCREEN = 'Carrinho\n1 item: Caneca\nTotal: R$ 30,00\nCupom inválido';

describe('proofWithValues', () => {
  /**
   * Haiku proved "the cart shows 1 item and the total R$ 30,00" with "1 item: Caneca" alone:
   * walked again without it, a wrong total would have passed.
   */
  it('adds a value the step expects that the screen shows and the proof left out', () => {
    expect(
      proofWithValues({ proof: '1 item: Caneca', values: ['R$ 30,00'], screen: SCREEN }),
    ).toBe('1 item: Caneca\nR$ 30,00');
  });

  it('adds NO value the screen does not show, nor one the proof already holds', () => {
    expect(
      proofWithValues({
        proof: 'Total: R$ 30,00',
        values: ['R$ 30,00', 'R$ 45,00'],
        screen: SCREEN,
      }),
    ).toBe('Total: R$ 30,00');
  });

  it('proves with the values alone a step the agent gave no proof for', () => {
    expect(
      proofWithValues({ proof: '', values: ['Cupom inválido'], screen: SCREEN }),
    ).toBe('Cupom inválido');
  });
});
