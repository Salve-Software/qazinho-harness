import type { Locator } from 'playwright-core';
import { describe, expect, it } from 'vitest';
import { screenBoxOf } from '@/engine/devices/WebDriver/library';

const SCREEN = { width: 1000, height: 500 };

const locator = (given: {
  placed: { x: number; y: number; width: number; height: number } | null;
  outer?: { left: number; top: number; width: number; height: number };
  text?: { left: number; top: number; width: number; height: number } | null;
  fails?: boolean;
}) =>
  ({
    boundingBox: () => Promise.resolve(given.placed),
    evaluate: () =>
      given.fails === true
        ? Promise.reject(new Error('gone'))
        : Promise.resolve({
            outer: given.outer ?? { left: 0, top: 0, width: 0, height: 0 },
            text: given.text ?? null,
          }),
  }) as unknown as Locator;

describe('where something is on the screen', () => {
  it('reads a control by its own box, as fractions of the screen', async () => {
    await expect(
      screenBoxOf({
        locator: locator({ placed: { x: 100, y: 50, width: 200, height: 100 } }),
        screen: SCREEN,
      }),
    ).resolves.toEqual({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });
  });

  /** Um título é um bloco da largura da página: marcar o bloco marcaria o nada ao lado. */
  it('reads a text by its letters, not by the whole block it sits in', async () => {
    await expect(
      screenBoxOf({
        locator: locator({
          placed: { x: 100, y: 50, width: 800, height: 40 },
          outer: { left: 20, top: 10, width: 800, height: 40 },
          text: { left: 20, top: 16, width: 200, height: 20 },
        }),
        screen: SCREEN,
      }),
    ).resolves.toEqual({ x: 0.1, y: 56 / 500, width: 0.2, height: 0.04 });
  });

  it('keeps the box when the text already fills it', async () => {
    await expect(
      screenBoxOf({
        locator: locator({
          placed: { x: 100, y: 50, width: 200, height: 100 },
          outer: { left: 0, top: 0, width: 200, height: 100 },
          text: { left: 2, top: 1, width: 196, height: 98 },
        }),
        screen: SCREEN,
      }),
    ).resolves.toEqual({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });
  });

  it('has nothing to say about what has no box or has gone', async () => {
    await expect(
      screenBoxOf({ locator: locator({ placed: null }), screen: SCREEN }),
    ).resolves.toBeNull();
    await expect(
      screenBoxOf({
        locator: locator({ placed: { x: 1, y: 1, width: 5, height: 5 }, fails: true }),
        screen: SCREEN,
      }),
    ).resolves.toBeNull();
  });
});
