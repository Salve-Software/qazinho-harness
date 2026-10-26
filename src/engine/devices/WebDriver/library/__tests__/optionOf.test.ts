import { describe, expect, it } from 'vitest';
import { optionOf } from '@/engine/devices/WebDriver/library';

const STATES = [
  { label: 'Choose', value: '' },
  { label: 'São Paulo', value: 'SP' },
  { label: 'Rio de Janeiro', value: 'RJ' },
];

describe('optionOf', () => {
  it('takes the option a person reads', () => {
    expect(optionOf({ options: STATES, wanted: 'São Paulo' })).toEqual(STATES[1]);
  });

  it('takes the value the form sends, when that is what the step names', () => {
    expect(optionOf({ options: STATES, wanted: 'RJ' })).toEqual(STATES[2]);
  });

  it('does not care about case or the spaces around', () => {
    expect(optionOf({ options: STATES, wanted: '  rio de janeiro ' })).toEqual(STATES[2]);
  });

  it('finds nothing for an option the dropdown does not have', () => {
    expect(optionOf({ options: STATES, wanted: 'Bahia' })).toBeNull();
  });
});
