import type { ICaseRecipe } from '@/contract';
import { describe, expect, it } from 'vitest';
import { fingerprintOf, recipeFor } from '@/engine/walk/library';
import { STEPS } from './fixtures';

const RECIPE: ICaseRecipe = {
  caseId: 'TC-01',
  fingerprint: fingerprintOf({ targetKind: 'android', steps: STEPS }),
  targetKind: 'android',
  steps: [
    { number: 1, actions: [], proof: 'Visitas: 1' },
    { number: 2, actions: [], proof: 'Visitas: 1' },
  ],
  runId: 'r-01',
  recordedAt: 0,
};

describe('recipeFor', () => {
  it('finds the recipe kept for this very case', () => {
    expect(
      recipeFor({ book: { cases: [RECIPE] }, steps: STEPS, targetKind: 'android' }),
    ).toBe(RECIPE);
  });

  it('does NOT use a recipe once the case was edited, or on another kind of target', () => {
    const [first, second] = STEPS;

    if (first === undefined || second === undefined) throw new Error('fixture');

    expect(
      recipeFor({
        book: { cases: [RECIPE] },
        steps: [first, { ...second, expected: 'Visitas: 2' }],
        targetKind: 'android',
      }),
    ).toBeNull();
    expect(
      recipeFor({ book: { cases: [RECIPE] }, steps: STEPS, targetKind: 'ios' }),
    ).toBeNull();
  });

  it('does NOT use a recipe that lacks one of the steps', () => {
    expect(
      recipeFor({
        book: { cases: [{ ...RECIPE, steps: RECIPE.steps.slice(0, 1) }] },
        steps: STEPS,
        targetKind: 'android',
      }),
    ).toBeNull();
  });
});
