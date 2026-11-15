import { describe, expect, it } from 'vitest';
import { withWindowAt } from '@/engine/devices/AndroidDriver/library';

describe('withWindowAt', () => {
  it('moves the window and keeps what the emulator wrote', () => {
    expect(
      withWindowAt({
        ini: 'window.x = 1200\nwindow.y = 80\nwindow.scale = 0.5\n',
        x: 420,
        y: 52,
      }),
    ).toBe('window.scale = 0.5\nwindow.x = 420\nwindow.y = 52\n');
  });

  it('writes the place into an AVD that never had one', () => {
    expect(withWindowAt({ ini: '', x: 420.6, y: 52.2 })).toBe(
      'window.x = 421\nwindow.y = 52\n',
    );
  });

  /** Uma chave que só começa igual, como `window.xyz`, é outra coisa. */
  it('does NOT drop a key that only starts like the place', () => {
    expect(withWindowAt({ ini: 'window.xyz = 1\n', x: 1, y: 2 })).toContain(
      'window.xyz = 1',
    );
  });
});
