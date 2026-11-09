import type { ICaseRecipe, IRecipeBook } from '@/contract';
import { describe, expect, it } from 'vitest';
import { fingerprintOf, partialFor, recipeFor } from '@/engine/walk/library';
import { STEPS } from './fixtures';

const kept: ICaseRecipe = {
  caseId: 'TC-01',
  fingerprint: fingerprintOf({ targetKind: 'android', steps: STEPS }),
  targetKind: 'android',
  steps: [{ number: 1, actions: [], proof: 'Visitas: 1' }],
  runId: 'r-01',
  recordedAt: 0,
};
const book: IRecipeBook = { cases: [], partial: [kept] };
const ask = { book, steps: STEPS, targetKind: 'android' as const };

describe('partialFor', () => {
  it('finds how far a case was recorded', () => {
    expect(partialFor(ask)).toEqual(kept);
  });

  it('never passes for the recipe of a whole case', () => {
    expect(recipeFor(ask)).toBeNull();
  });

  it('finds nothing for another kind of target', () => {
    expect(partialFor({ ...ask, targetKind: 'web' })).toBeNull();
  });

  it('finds nothing once the case says something else', () => {
    expect(
      partialFor({
        ...ask,
        steps: STEPS.map((step) => ({ ...step, expected: 'Visitas: 2' })),
      }),
    ).toBeNull();
  });

  it('finds nothing in a book that never kept one', () => {
    expect(partialFor({ ...ask, book: { cases: [] } })).toBeNull();
  });

  it('refuses steps that are not the first ones of the case', () => {
    expect(
      partialFor({
        ...ask,
        book: {
          cases: [],
          partial: [{ ...kept, steps: [{ number: 2, actions: [], proof: 'x' }] }],
        },
      }),
    ).toBeNull();
  });
});
