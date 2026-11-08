import type { Locator } from 'playwright-core';
import { describe, expect, it } from 'vitest';
import { pressChecked } from '@/engine/devices/WebDriver/library';

/**
 * Um frame de mentira: o `run` é o que o evaluate do Playwright rodaria na página. O estado
 * vive no globalThis porque a função passada ao evaluate lê a sonda de lá.
 */
type Probe = { pressed?: boolean } | undefined;

function fakeLocator(props: { fails?: boolean; hasHandle?: boolean }): Locator {
  const frame = {
    evaluate: (run: () => unknown) =>
      props.fails === true
        ? Promise.reject(new Error('navigated'))
        : Promise.resolve(run()),
  };
  const handle = {
    ownerFrame: () => Promise.resolve(frame),
    dispose: () => Promise.resolve(),
  };

  return {
    elementHandle: () =>
      props.hasHandle === false
        ? Promise.reject(new Error('gone'))
        : Promise.resolve(handle),
  } as unknown as Locator;
}

const setProbe = (probe: Probe) => {
  (globalThis as unknown as { __qazinho?: Probe }).__qazinho = probe;
};

const press = (locator: Locator, onPress: () => void) =>
  pressChecked({
    locator,
    target: 'Save',
    press: () => {
      onPress();

      return Promise.resolve();
    },
  });

describe('a press the page has to receive', () => {
  it('goes through when the page saw it', async () => {
    const probe: Probe = {};

    setProbe(probe);

    await expect(
      press(fakeLocator({}), () => (probe.pressed = true)),
    ).resolves.toBeUndefined();
  });

  it('fails in words when the browser took it and the page never saw it', async () => {
    setProbe({});

    await expect(press(fakeLocator({}), () => undefined)).rejects.toThrow(
      'The click on "Save" never reached the page',
    );
  });

  it('waits a moment for a page that is slow to receive it', async () => {
    const probe: Probe = {};

    setProbe(probe);

    await expect(
      press(fakeLocator({}), () => {
        setTimeout(() => (probe.pressed = true), 50);
      }),
    ).resolves.toBeUndefined();
  });

  it('counts as received when the press took the page somewhere new', async () => {
    setProbe({});

    await expect(
      press(fakeLocator({}), () => setProbe(undefined)),
    ).resolves.toBeUndefined();
  });

  it('does not judge a frame it can no longer ask', async () => {
    setProbe({});

    await expect(
      press(fakeLocator({ fails: true }), () => undefined),
    ).resolves.toBeUndefined();
  });

  it('does not judge an element that left before it could be held', async () => {
    setProbe({});

    await expect(
      press(fakeLocator({ hasHandle: false }), () => undefined),
    ).resolves.toBeUndefined();
  });
});
