import { describe, expect, it } from 'vitest';
import { fingerprintOf, partialRecipeOf, recipeOf } from '@/engine/walk/library';
import { STEPS } from './fixtures';

const TAP = { kind: 'click' as const, target: 'Salvar visita', value: '' };
const BASE = {
  steps: STEPS,
  targetKind: 'android' as const,
  actions: new Map([[1, [TAP]]]),
  runId: 'r-03',
  at: 1_760_000_000_000,
};

describe('partialRecipeOf', () => {
  it('keeps the steps that passed before the one that stopped the case', () => {
    expect(partialRecipeOf({ ...BASE, proofs: new Map([[1, 'Visitas: 1']]) })).toEqual({
      caseId: 'TC-01',
      fingerprint: fingerprintOf({ targetKind: 'android', steps: STEPS }),
      targetKind: 'android',
      steps: [{ number: 1, actions: [TAP], proof: 'Visitas: 1' }],
      runId: 'r-03',
      recordedAt: 1_760_000_000_000,
    });
  });

  it('holds the fingerprint of the whole case, so it stops counting once the case changes', () => {
    const partial = partialRecipeOf({ ...BASE, proofs: new Map([[1, 'Visitas: 1']]) });
    const justFirst = recipeOf({
      ...BASE,
      steps: STEPS.slice(0, 1),
      proofs: new Map([[1, 'Visitas: 1']]),
    });

    expect(partial?.fingerprint).not.toBe(justFirst?.fingerprint);
  });

  it('keeps nothing when the first step did not pass', () => {
    expect(partialRecipeOf({ ...BASE, proofs: new Map() })).toBeNull();
    expect(partialRecipeOf({ ...BASE, proofs: new Map([[2, 'Visitas: 1']]) })).toBeNull();
  });

  it('leaves a case that passed whole to the recipe of the case', () => {
    expect(
      partialRecipeOf({
        ...BASE,
        proofs: new Map([
          [1, 'Visitas: 1'],
          [2, 'Visitas: 1'],
        ]),
      }),
    ).toBeNull();
  });

  it('stops at a step that passed with nothing on the screen to check', () => {
    expect(
      partialRecipeOf({
        ...BASE,
        proofs: new Map([
          [1, '   '],
          [2, 'Visitas: 1'],
        ]),
      }),
    ).toBeNull();
  });
});
