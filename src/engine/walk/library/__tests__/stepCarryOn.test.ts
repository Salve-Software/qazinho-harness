import { describe, expect, it } from 'vitest';
import { findingAnswer, stepCarryOn } from '@/engine/walk/library';

describe('stepCarryOn', () => {
  /**
   * O Haiku abria o total errado que viu como bug, e depois reprovava o passo pela mesma
   * coisa: o QA recebia duas vezes na run. A resposta diz como manter num bug só.
   */
  it('tells the agent to fail the step under the same title when the bug is what it expects', () => {
    expect(findingAnswer({ asked: undefined, kept: null, carryOn: stepCarryOn(2) })).toBe(
      'Filed as a bug. If it is what step 2 expects, report step 2 failed with this same title, so it stays one bug. Carry on with step 2.',
    );
  });
});
