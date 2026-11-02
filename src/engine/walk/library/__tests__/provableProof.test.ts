import { describe, expect, it } from 'vitest';
import { proofHolds, provableProof } from '@/engine/walk/library';

const VALUES = [
  { name: 'LOJA_EMAIL', description: 'o e-mail', value: 'cliente@loja.dev' },
];

/** O texto da tela como a run o lê, com o valor da variável já escrito como o nome dela. */
const SCREEN = 'Entrar\nE-mail ${LOJA_EMAIL}\nSenha\nOlá, cliente';

describe('provableProof', () => {
  /**
   * O Haiku copiou o e-mail da foto da tela. A receita guardava o valor, e a run seguinte nunca
   * o achava no texto, que o mostra pelo nome: o caso era "curado" pelo agente em toda run.
   */
  it('writes a value the agent copied from the photo as its name, and it holds', () => {
    const proof = provableProof({
      proof: 'cliente@loja.dev',
      screen: SCREEN,
      values: VALUES,
    });

    expect(proof).toBe('${LOJA_EMAIL}');
    expect(proofHolds({ screen: SCREEN, proof })).toBe(true);
  });

  /** Os pontos de um campo de senha só existem na foto. */
  it('drops a line only the photo shows, and keeps the ones the text does', () => {
    expect(
      provableProof({
        proof: '••••••••••\nOlá, cliente',
        screen: SCREEN,
        values: VALUES,
      }),
    ).toBe('Olá, cliente');
  });

  /** Sem linha a conferir, o caso não vira receita: anda com o agente, sem dizer "curado". */
  it('leaves nothing when no line can be checked', () => {
    expect(provableProof({ proof: '••••••••••', screen: SCREEN, values: VALUES })).toBe(
      '',
    );
  });

  it('reads a line as a person would, without minding case or spaces', () => {
    expect(
      provableProof({ proof: 'OLÁ,   CLIENTE', screen: SCREEN, values: VALUES }),
    ).toBe('OLÁ,   CLIENTE');
  });

  it('leaves nothing from a screen it could not read', () => {
    expect(provableProof({ proof: 'Olá, cliente', screen: '', values: VALUES })).toBe('');
  });
});
