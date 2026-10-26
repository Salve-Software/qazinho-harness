import type { IKnownBug } from '@/contract';
import { describe, expect, it } from 'vitest';
import { landingOf } from '@/engine/runner/library';

const KNOWN: IKnownBug[] = [
  {
    id: 'b1',
    title: 'Pix code never shows',
    caseId: 'pix',
    stepNumber: 2,
    isIncidental: false,
  },
  {
    id: 'b2',
    title: 'Total shows twice',
    caseId: 'pix',
    stepNumber: 1,
    isIncidental: true,
  },
];

const caught = {
  sameAs: undefined,
  caseId: 'coupon',
  stepNumber: 1,
  title: 'Coupon refused',
  isIncidental: false,
  known: KNOWN,
  filed: [],
};

describe('landingOf', () => {
  it('lands on the open bug its agent named', () => {
    expect(landingOf({ ...caught, sameAs: 'b2' })).toEqual({
      kind: 'known',
      bugId: 'b2',
    });
  });

  it('lands a failure on the bug its plan step failed for before', () => {
    expect(landingOf({ ...caught, caseId: 'pix', stepNumber: 2 })).toEqual({
      kind: 'known',
      bugId: 'b1',
    });
  });

  it('does NOT land a finding on the bug of the step it was seen beside', () => {
    expect(
      landingOf({ ...caught, caseId: 'pix', stepNumber: 2, isIncidental: true }),
    ).toEqual({ kind: 'new' });
  });

  it('lands on an open bug with the same title, spacing and case aside', () => {
    expect(landingOf({ ...caught, title: '  total SHOWS   twice ' })).toEqual({
      kind: 'known',
      bugId: 'b2',
    });
  });

  it('lands a repeat on the bug this run filed already', () => {
    expect(
      landingOf({
        ...caught,
        filed: [
          {
            id: 'r1-bug-1',
            title: 'Coupon refused',
            caseId: 'x',
            stepNumber: 9,
            isIncidental: true,
          },
        ],
      }),
    ).toEqual({ kind: 'filed', bugId: 'r1-bug-1' });
  });

  it('files the rest as new', () => {
    expect(landingOf(caught)).toEqual({ kind: 'new' });
  });
});
