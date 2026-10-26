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
  it('puts a new recipe in place of the one its case had, and keeps the others', () => {
    expect(
      bookWith({
        book: { cases: [recipe('TC-01', 'r-01'), recipe('TC-02', 'r-01')] },
        recipes: [recipe('TC-01', 'r-02')],
      }).cases.map(({ caseId, runId }) => `${caseId} ${runId}`),
    ).toEqual(['TC-02 r-01', 'TC-01 r-02']);
  });

  it('leaves the book as it was with nothing new', () => {
    expect(bookWith({ book: { cases: [recipe('TC-01', 'r-01')] }, recipes: [] })).toEqual(
      {
        cases: [recipe('TC-01', 'r-01')],
      },
    );
  });
});
