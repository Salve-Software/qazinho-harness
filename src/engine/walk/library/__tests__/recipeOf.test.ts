import { describe, expect, it } from 'vitest';
import { fingerprintOf, recipeOf } from '@/engine/walk/library';
import { STEPS } from './fixtures';

const TAP = { kind: 'click' as const, target: 'Salvar visita', value: '' };
const REOPEN = { kind: 'reopen' as const, target: '', value: '' };

describe('recipeOf', () => {
  it('keeps what each step did and the words that proved it', () => {
    expect(
      recipeOf({
        steps: STEPS,
        targetKind: 'android',
        actions: new Map([
          [1, [TAP]],
          [2, [REOPEN]],
        ]),
        proofs: new Map([
          [1, 'Visitas: 1'],
          [2, 'Visitas: 1'],
        ]),
        runId: 'r-03',
        at: 1_760_000_000_000,
      }),
    ).toEqual({
      caseId: 'TC-01',
      fingerprint: fingerprintOf({ targetKind: 'android', steps: STEPS }),
      targetKind: 'android',
      steps: [
        { number: 1, actions: [TAP], proof: 'Visitas: 1' },
        { number: 2, actions: [REOPEN], proof: 'Visitas: 1' },
      ],
      runId: 'r-03',
      recordedAt: 1_760_000_000_000,
    });
  });

  it('keeps a step that only looked, with no action of its own', () => {
    expect(
      recipeOf({
        steps: STEPS,
        targetKind: 'android',
        actions: new Map([[1, [TAP]]]),
        proofs: new Map([
          [1, 'Visitas: 1'],
          [2, 'Visitas: 1'],
        ]),
        runId: 'r-03',
        at: 0,
      })?.steps[1],
    ).toEqual({ number: 2, actions: [], proof: 'Visitas: 1' });
  });

  it('does NOT keep a case when a step left no proof to check', () => {
    expect(
      recipeOf({
        steps: STEPS,
        targetKind: 'android',
        actions: new Map([[1, [TAP]]]),
        proofs: new Map([[1, 'Visitas: 1']]),
        runId: 'r-03',
        at: 0,
      }),
    ).toBeNull();
  });

  /**
   * O look numera controles iguais ("Adicionar ao carrinho #6"), e o agente copiou isso
   * como prova: o arquivo do Playwright exportado procurava um texto que a página não tem.
   */
  it('keeps a proof as the screen says it, without the number look gives a namesake', () => {
    const recipe = recipeOf({
      steps: STEPS,
      targetKind: 'web',
      actions: new Map([
        [1, [TAP]],
        [2, [REOPEN]],
      ]),
      proofs: new Map([
        [1, 'Carrinho1\nAdicionar ao carrinho #6'],
        [2, 'Visitas: 1'],
      ]),
      runId: 'r-03',
      at: 1_760_000_000_000,
    });

    expect(recipe?.steps[0]?.proof).toBe('Carrinho1\nAdicionar ao carrinho');
  });
});
