import type { ICaseRecipe } from '@/contract';
import { describe, expect, it } from 'vitest';
import { bookWith } from '@/engine/walk/library';

const recipe = (caseId: string, runId: string): ICaseRecipe => ({
  caseId,
  fingerprint: 'f',
  targetKind: 'web',
  steps: [],
  runId,
  recordedAt: 0,
});

describe('bookWith', () => {
  it('keeps how far a case got, and only the latest of it', () => {
    expect(
      bookWith({
        book: { cases: [], partial: [recipe('TC-1', 'old'), recipe('TC-2', 'kept')] },
        recipes: [],
        partial: [recipe('TC-1', 'new')],
      }).partial,
    ).toEqual([recipe('TC-2', 'kept'), recipe('TC-1', 'new')]);
  });

  it('drops how far a case got once it is recorded whole', () => {
    expect(
      bookWith({
        book: { cases: [], partial: [recipe('TC-1', 'old')] },
        recipes: [recipe('TC-1', 'whole')],
      }),
    ).toEqual({ cases: [recipe('TC-1', 'whole')] });
  });

  it('never lets a partial stand beside a whole recipe of the same case', () => {
    expect(
      bookWith({
        book: { cases: [recipe('TC-1', 'whole')] },
        recipes: [],
        partial: [recipe('TC-1', 'failed')],
      }),
    ).toEqual({ cases: [recipe('TC-1', 'whole')] });
  });

  it('puts a new recipe in place of the one its case had, and keeps the others', () => {
    expect(
      bookWith({
        book: { cases: [recipe('TC-01', 'r-01'), recipe('TC-02', 'r-01')] },
        recipes: [recipe('TC-01', 'r-02')],
      }).cases.map(({ caseId, runId }) => `${caseId} ${runId}`),
    ).toEqual(['TC-02 r-01', 'TC-01 r-02']);
  });

  it('keeps the preparations of the cases walked by hand', () => {
    expect(
      bookWith({
        book: { cases: [], preps: [recipe('TC-07', 'prep')] },
        recipes: [recipe('TC-01', 'r-01')],
      }).preps,
    ).toEqual([recipe('TC-07', 'prep')]);
  });

  it('leaves the book as it was with nothing new', () => {
    expect(bookWith({ book: { cases: [recipe('TC-01', 'r-01')] }, recipes: [] })).toEqual(
      {
        cases: [recipe('TC-01', 'r-01')],
      },
    );
  });
});
