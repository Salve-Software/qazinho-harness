import { describe, expect, it } from 'vitest';
import { FIELD_FORMATS } from '@/engine/devices/WebDriver/constants';

describe('FIELD_FORMATS', () => {
  it('covers every field Chrome only fills in its own format', () => {
    expect(Object.keys(FIELD_FORMATS).sort()).toEqual([
      'date',
      'datetime-local',
      'month',
      'time',
      'week',
    ]);
  });

  it('gives the agent an example to copy for each', () => {
    for (const format of Object.values(FIELD_FORMATS))
      expect(format).toMatch(/such as \S+$/);
  });

  it('does NOT cover a text field, which takes anything', () => {
    expect(FIELD_FORMATS.text).toBeUndefined();
  });
});
