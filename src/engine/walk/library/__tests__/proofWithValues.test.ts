import { describe, expect, it } from 'vitest';
import { proofWithValues } from '@/engine/walk/library';

const SCREEN = 'Carrinho\n1 item: Caneca\nTotal: R$ 30,00\nCupom inválido';

describe('proofWithValues', () => {
  /**
   * O Haiku provou "o carrinho mostra 1 item e o total R$ 30,00" só com "1 item: Caneca":
   * andado de novo sem isso, um total errado teria passado.
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
