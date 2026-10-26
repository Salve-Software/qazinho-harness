import { describe, expect, it } from 'vitest';
import { valuesOf } from '@/engine/runner/library';

describe('valuesOf', () => {
  it('types each CI variable by its value, a missing description read as none', () => {
    expect(
      valuesOf([
        { name: 'PASSWORD', description: 'The account password', value: 's3cret' },
        { name: 'TOKEN', description: null, value: 't0k3n' },
      ]),
    ).toEqual([
      { name: 'PASSWORD', description: 'The account password', value: 's3cret' },
      { name: 'TOKEN', description: '', value: 't0k3n' },
    ]);
  });
});
