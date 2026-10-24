import { describe, expect, it } from 'vitest';
import { describeVariables } from '@/context/library';

describe('describeVariables', () => {
  it('lists each variable by its ${NAME}, with what it holds when it says', () => {
    expect(
      describeVariables([
        { name: 'LOGIN_EMAIL', description: 'The admin' },
        { name: 'LOGIN_PASSWORD', description: '' },
      ]),
    ).toEqual([
      '',
      'Variables the project keeps, to type as written:',
      '- ${LOGIN_EMAIL}: The admin',
      '- ${LOGIN_PASSWORD}',
    ]);
  });

  it('says nothing when the project keeps none', () => {
    expect(describeVariables([])).toEqual([]);
  });
});
