import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';
import { describe, expect, it } from 'vitest';
import { isListedControl } from '@/engine/devices/AndroidDriver/library';

const NODE: IScreenNode = {
  text: 'Save visit',
  desc: '',
  id: 'save',
  role: 'android.widget.Button',
  isClickable: true,
  isEditable: false,
  x: 10,
  y: 10,
  box: { x: 0, y: 0, width: 20, height: 20 },
};

describe('isListedControl', () => {
  it('lists a button with words on it', () => {
    expect(isListedControl(NODE)).toBe(true);
  });

  it('lists a field to type in, even empty', () => {
    expect(
      isListedControl({ ...NODE, text: '', isClickable: false, isEditable: true }),
    ).toBe(true);
  });

  it('does NOT list text nobody can touch: that is what the screen reads, not a control', () => {
    expect(isListedControl({ ...NODE, isClickable: false })).toBe(false);
  });

  it('does NOT list a control with nothing to name it by', () => {
    expect(isListedControl({ ...NODE, text: '' })).toBe(false);
  });
});
