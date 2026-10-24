import { describe, expect, it } from 'vitest';
import { bugIdNamed } from '@/tools/library';

const ID = bugIdNamed('The bug it is.');

describe('bugIdNamed', () => {
  it('takes the id of a bug, trimmed and in capitals', () => {
    expect(ID.parse(' bug-07 ')).toBe('BUG-07');
  });

  it('may be left out, for a bug that is new', () => {
    expect(ID.parse(undefined)).toBeUndefined();
  });

  it('says how an id reads when it is given something else', () => {
    for (const value of ['the coupon bug', 'BUG-', 7])
      expect(ID.safeParse(value).error?.issues[0]?.message).toBe(
        '"sameAs" is the id of a bug already open, such as "BUG-01".',
      );
  });
});
