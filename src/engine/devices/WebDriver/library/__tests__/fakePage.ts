import type { Locator, Page } from 'playwright-core';

type FakeLocator = {
  name: string;
  count: () => Promise<number>;
  first: () => Locator;
  filter: () => Locator;
  nth: (index: number) => Locator;
};

/** A stand-in for the browser: the library talks to a port, so a test does not need Chrome. */
export function fakeLocator(props: { name: string; count: number }): Locator {
  const locator: FakeLocator = {
    name: props.name,
    count: () => Promise.resolve(props.count),
    first: () => locator as unknown as Locator,
    filter: () => locator as unknown as Locator,
    nth: (index) =>
      fakeLocator({
        name: index === 0 ? props.name : `${props.name}#${String(index + 1)}`,
        count: 1,
      }),
  };

  return locator as unknown as Locator;
}

export function fakePage(parts: Partial<Record<string, unknown>>): Page {
  return parts as unknown as Page;
}

export function locatorName(locator: Locator | null): string | null {
  return locator ? (locator as unknown as FakeLocator).name : null;
}
