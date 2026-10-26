import { describe, expect, it } from 'vitest';
import { findingAnswer } from '@/engine/walk/library';

const CARRY_ON = 'Carry on with step 2.';

describe('findingAnswer', () => {
  it('says a bug the agent named was counted as seen again', () => {
    expect(findingAnswer({ asked: 'BUG-01', kept: 'BUG-01', carryOn: CARRY_ON })).toBe(
      'Counted as BUG-01 seen again. Carry on with step 2.',
    );
  });

  it('says a bug named by an id that is not open went in as a new one', () => {
    expect(findingAnswer({ asked: 'BUG-07', kept: null, carryOn: CARRY_ON })).toBe(
      'There is no BUG-07 open, so it was filed as a new bug. Carry on with step 2.',
    );
  });

  it('files a bug the agent did not name as a new one', () => {
    expect(findingAnswer({ asked: undefined, kept: null, carryOn: CARRY_ON })).toBe(
      'Filed as a bug. Carry on with step 2.',
    );
  });
});
