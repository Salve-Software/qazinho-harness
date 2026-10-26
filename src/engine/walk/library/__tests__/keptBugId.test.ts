import type { IKnownBug } from '@/contract';
import { describe, expect, it } from 'vitest';
import { keptBugId } from '@/engine/walk/library';

const KNOWN: IKnownBug[] = [
  {
    id: 'BUG-01',
    title: 'An expired coupon is accepted',
    caseId: 'TC-02',
    stepNumber: 1,
    isIncidental: false,
  },
];

describe('keptBugId', () => {
  it('keeps the id of a bug the run was told is open', () => {
    expect(keptBugId({ asked: 'BUG-01', known: KNOWN })).toBe('BUG-01');
  });

  it('does NOT keep an id that names no bug open, so a made-up one never lands', () => {
    expect(keptBugId({ asked: 'BUG-07', known: KNOWN })).toBeNull();
  });

  it('keeps nothing for a bug the agent filed as new', () => {
    expect(keptBugId({ asked: undefined, known: KNOWN })).toBeNull();
  });
});
