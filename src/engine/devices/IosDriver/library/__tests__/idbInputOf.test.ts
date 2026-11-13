import { describe, expect, it } from 'vitest';
import { idbInputOf } from '@/engine/devices/IosDriver/library';

const size = { width: 400, height: 800 };

describe('a gesture of the QA as idb ui', () => {
  it('taps the point under the fraction the QA touched', () => {
    expect(idbInputOf({ input: { kind: 'tap', x: 0.5, y: 0.5 }, size })).toEqual([
      ['tap', '200', '400'],
    ]);
  });

  it('scrolls by swiping the other way, and drags slowly', () => {
    expect(
      idbInputOf({ input: { kind: 'scroll', x: 0.5, y: 0.5, dx: 0, dy: 0.25 }, size }),
    ).toEqual([['swipe', '200', '400', '200', '200', '--duration', '0.35']]);
    expect(
      idbInputOf({ input: { kind: 'drag', x: 0, y: 0, toX: 0.5, toY: 0.5 }, size }),
    ).toEqual([['swipe', '0', '0', '200', '400', '--duration', '1.5']]);
  });

  it('types text as it is, and keys by their HID code', () => {
    expect(idbInputOf({ input: { kind: 'type', text: 'ação "x"' }, size })).toEqual([
      ['text', 'ação "x"'],
    ]);
    expect(idbInputOf({ input: { kind: 'key', key: 'Enter' }, size })).toEqual([
      ['key', '40'],
    ]);
  });

  it('does nothing for a key the phone does not have', () => {
    expect(idbInputOf({ input: { kind: 'key', key: 'Back' }, size })).toEqual([]);
  });
});
