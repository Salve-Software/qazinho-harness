import { describe, expect, it } from 'vitest';
import { findElement } from '@/engine/devices/IosDriver/library';

const ELEMENTS = [
  {
    label: 'Sign in with Apple',
    role: 'Button',
    x: 10,
    y: 10,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
  {
    label: 'Sign in',
    role: 'Button',
    x: 20,
    y: 20,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
  {
    label: '',
    role: 'Other',
    x: 30,
    y: 30,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
];

describe('findElement', () => {
  it('prefers the whole label over one that merely contains it', () => {
    expect(findElement({ elements: ELEMENTS, target: 'Sign in' })?.x).toBe(20);
  });

  it('takes part of a label, because the agent shortens what it saw', () => {
    expect(findElement({ elements: ELEMENTS, target: 'with Apple' })?.x).toBe(10);
  });

  it('takes the second of several that read alike when the agent says #2', () => {
    const rows = [
      {
        label: 'Buy',
        role: 'Button',
        x: 1,
        y: 1,
        isLaunchIcon: false,
        box: { x: 0, y: 0, width: 10, height: 10 },
      },
      {
        label: 'Buy',
        role: 'Button',
        x: 2,
        y: 2,
        isLaunchIcon: false,
        box: { x: 0, y: 0, width: 10, height: 10 },
      },
    ];

    expect(findElement({ elements: rows, target: 'Buy #2' })?.x).toBe(2);
    expect(findElement({ elements: rows, target: 'Buy #3' })).toBeNull();
  });

  it('finds a control the agent copied the way look lists it', () => {
    expect(findElement({ elements: ELEMENTS, target: 'button: Sign in' })?.x).toBe(20);
  });

  it('does not care about case', () => {
    expect(findElement({ elements: ELEMENTS, target: 'SIGN IN' })?.x).toBe(20);
  });

  it('never matches an element with nothing written on it', () => {
    expect(findElement({ elements: ELEMENTS, target: '' })).toBeNull();
  });

  it('nothing on the screen answering is null, not the first element', () => {
    expect(findElement({ elements: ELEMENTS, target: 'Register' })).toBeNull();
  });
});
