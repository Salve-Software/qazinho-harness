import { describe, expect, it } from 'vitest';
import { readBook } from '@/engine/walk/library';

describe('readBook', () => {
  it('reads how far a case got back from the file', () => {
    expect(readBook(JSON.stringify({ cases: [], partial: [] }))).toEqual({
      cases: [],
      partial: [],
    });
  });

  it('reads the recipes a workspace kept', () => {
    expect(readBook('{"cases":[{"caseId":"TC-01"}]}').cases).toHaveLength(1);
  });

  it('reads a missing, broken or foreign file as an empty book', () => {
    expect(readBook(null)).toEqual({ cases: [] });
    expect(readBook('{not json')).toEqual({ cases: [] });
    expect(readBook('{"cases":"nope"}')).toEqual({ cases: [] });
  });
});
