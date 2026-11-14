import { describe, expect, it } from 'vitest';
import { adbInputOf } from '@/engine/devices/AndroidDriver/library';

const size = { width: 1000, height: 2000 };

describe('a gesture of the QA as adb input', () => {
  it('taps the pixel under the fraction the QA touched', () => {
    expect(adbInputOf({ input: { kind: 'tap', x: 0.5, y: 0.25 }, size })).toEqual([
      ['input', 'tap', '500', '500'],
    ]);
  });

  it('scrolls down by moving the finger up, the length the QA scrolled', () => {
    expect(
      adbInputOf({ input: { kind: 'scroll', x: 0.5, y: 0.5, dx: 0, dy: 0.25 }, size }),
    ).toEqual([['input', 'swipe', '500', '1000', '500', '500', '350']]);
  });

  it('drags slowly from where the QA pressed to where they let go', () => {
    expect(
      adbInputOf({
        input: { kind: 'drag', x: 0.1, y: 0.1, toX: 0.9, toY: 0.1 },
        size,
      }),
    ).toEqual([['input', 'swipe', '100', '200', '900', '200', '1500']]);
  });

  it('types text the way the run types it, and keys by their keycode', () => {
    expect(adbInputOf({ input: { kind: 'type', text: 'a b' }, size })).toEqual([
      ['input', 'text', 'a%sb'],
    ]);
    expect(adbInputOf({ input: { kind: 'key', key: 'Backspace' }, size })).toEqual([
      ['input', 'keyevent', 'KEYCODE_DEL'],
    ]);
    expect(adbInputOf({ input: { kind: 'key', key: 'Back' }, size })).toEqual([
      ['input', 'keyevent', 'KEYCODE_BACK'],
    ]);
  });

  it('does NOT type a double quote, which adb cannot', () => {
    expect(() => adbInputOf({ input: { kind: 'type', text: 'say "hi"' }, size })).toThrow(
      /double quote/,
    );
  });
});
