import { describe, expect, it } from 'vitest';
import { numberDuplicates } from '@/engine/devices/library';

describe('numberDuplicates', () => {
  it('numbers the controls that read alike, in page order', () => {
    expect(
      numberDuplicates([
        'a: Início',
        'button: Comprar',
        'button: Comprar',
        'button: Comprar',
      ]),
    ).toEqual([
      'a: Início',
      'button: Comprar #1',
      'button: Comprar #2',
      'button: Comprar #3',
    ]);
  });

  it('leaves a control that reads like no other as it is', () => {
    expect(numberDuplicates(['button: Buscar', 'a: Produtos'])).toEqual([
      'button: Buscar',
      'a: Produtos',
    ]);
  });

  /**
   * Uma página de login tem um link "Entrar" no menu e um botão "Entrar" no formulário.
   * Sem número, o agente chamava o botão de "Entrar #2" mesmo assim, e o clique achava o
   * título.
   */
  it('numbers a link and a button of the same words, since the agent names both by their words', () => {
    expect(numberDuplicates(['a: Entrar', 'input: E-mail', 'button: Entrar'])).toEqual([
      'a: Entrar #1',
      'input: E-mail',
      'button: Entrar #2',
    ]);
  });

  it('reads words that differ only in capitals as the same words', () => {
    expect(numberDuplicates(['a: SAVE', 'button: Save'])).toEqual([
      'a: SAVE #1',
      'button: Save #2',
    ]);
  });
});
