import { describe, expect, it } from 'vitest';
import { findLocator } from '@/engine/devices/WebDriver/library';
import { fakeLocator, fakePage, locatorName } from './fakePage';

/** A page where only the named ways of finding answer, each with how many it finds. */
function pageWith(found: Record<string, number>) {
  const answer = (name: string) => fakeLocator({ name, count: found[name] ?? 0 });
  const exactly = (options?: { exact?: boolean }) =>
    options?.exact === true ? ':exact' : '';

  return fakePage({
    getByRole: (role: string, options?: { exact?: boolean }) =>
      answer(`role:${role}${exactly(options)}`),
    getByLabel: (_: string, options?: { exact?: boolean }) =>
      answer(`label${exactly(options)}`),
    getByPlaceholder: (_: string, options?: { exact?: boolean }) =>
      answer(`placeholder${exactly(options)}`),
    getByText: (_: string, options?: { exact?: boolean }) =>
      answer(`text${exactly(options)}`),
    locator: () => answer('css'),
  });
}

describe('findLocator', () => {
  /**
   * "Cupom" named both a field and the "Aplicar cupom" button, and a fill found the button
   * first: the run typed nothing and clicked Apply on an empty coupon.
   */
  it('finds a field to type in before a button that shares its name', async () => {
    const page = pageWith({ 'role:button': 1, label: 1, 'label:exact': 1 });

    expect(locatorName(await findLocator({ page, target: 'Cupom', kind: 'fill' }))).toBe(
      'label:exact',
    );
  });

  it('finds a button to click before a field that shares its name', async () => {
    const page = pageWith({ 'role:button': 1, 'label:exact': 1 });

    expect(locatorName(await findLocator({ page, target: 'Cupom', kind: 'click' }))).toBe(
      'role:button',
    );
  });

  it('takes the exact name before a part of it', async () => {
    const page = pageWith({ 'role:button': 2, 'role:button:exact': 1 });

    expect(
      locatorName(await findLocator({ page, target: 'Entrar', kind: 'click' })),
    ).toBe('role:button:exact');
  });

  /** Three "Comprar" buttons, one per product: the agent names the one it means by number. */
  it('takes the second of several when the agent says #2', async () => {
    const page = pageWith({ 'role:button:exact': 3 });

    expect(
      locatorName(await findLocator({ page, target: 'Comprar #2', kind: 'click' })),
    ).toBe('role:button:exact#2');
  });

  it('looks further when a number is past what one way finds', async () => {
    const page = pageWith({ 'role:button:exact': 1, 'text:exact': 3 });

    expect(
      locatorName(await findLocator({ page, target: 'Comprar #3', kind: 'click' })),
    ).toBe('text:exact#3');
  });

  /** The agent copied the control the way look lists it, "button: Entrar", which is not its name. */
  it('finds a control the agent copied the way look lists it', async () => {
    const named = (name?: string) =>
      fakeLocator({ name: 'role:button', count: name === 'Entrar' ? 1 : 0 });
    const none = () => fakeLocator({ name: 'none', count: 0 });
    const page = fakePage({
      getByRole: (_: string, options?: { name?: string }) => named(options?.name),
      getByLabel: none,
      getByPlaceholder: none,
      getByText: none,
      locator: none,
    });

    expect(
      locatorName(await findLocator({ page, target: 'button: Entrar', kind: 'click' })),
    ).toBe('role:button');
  });

  it('a css selector is the last thing tried, not the first', async () => {
    const page = pageWith({ css: 1 });

    expect(
      locatorName(await findLocator({ page, target: '#submit', kind: 'click' })),
    ).toBe('css');
  });

  it('nothing on the page answering is null, not a locator that finds nothing', async () => {
    expect(
      await findLocator({ page: pageWith({}), target: 'Ghost', kind: 'click' }),
    ).toBeNull();
  });

  it('a blank target never touches the page', async () => {
    expect(
      await findLocator({ page: fakePage({}), target: '  ', kind: 'fill' }),
    ).toBeNull();
  });

  it('a way of finding that throws while counting is no match', async () => {
    const page = fakePage({
      getByRole: () => ({
        filter: () => ({ count: () => Promise.reject(new Error('bad selector')) }),
      }),
      getByLabel: () => fakeLocator({ name: 'label', count: 1 }),
      getByPlaceholder: () => fakeLocator({ name: 'placeholder', count: 0 }),
      getByText: () => fakeLocator({ name: 'text', count: 0 }),
      locator: () => fakeLocator({ name: 'css', count: 0 }),
    });

    expect(locatorName(await findLocator({ page, target: 'Email', kind: 'click' }))).toBe(
      'label',
    );
  });

  /**
   * The menu's "Entrar" link and the form's "Entrar" button: look numbers them #1 and #2 in page
   * order, and "Entrar #2" has to be the button, not the second of whatever role came first.
   */
  it('takes "#2" as the second control of that name in the list look gave, whatever its role', async () => {
    const page = fakePage({
      $$eval: () =>
        Promise.resolve([
          { role: 'a', label: 'Início', at: 0 },
          { role: 'a', label: 'Entrar', at: 3 },
          { role: 'input', label: 'E-mail', at: 4 },
          { role: 'button', label: 'Entrar', at: 6 },
        ]),
      locator: () => ({
        nth: (index: number) =>
          fakeLocator({ name: `listed@${String(index)}`, count: 1 }),
      }),
    });

    expect(
      locatorName(await findLocator({ page, target: 'Entrar #2', kind: 'click' })),
    ).toBe('listed@6');
    expect(
      locatorName(await findLocator({ page, target: 'entrar #1', kind: 'click' })),
    ).toBe('listed@3');
  });

  it('falls back to the usual search when the list has no such number', async () => {
    const page = pageWith({ 'role:button:exact': 3 });

    expect(
      locatorName(await findLocator({ page, target: 'Comprar #2', kind: 'click' })),
    ).toBe('role:button:exact#2');
  });
});
