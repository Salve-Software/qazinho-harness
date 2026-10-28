import { describe, expect, it } from 'vitest';
import { findLocator } from '@/engine/devices/WebDriver/library';
import { fakeLocator, fakePage, locatorName } from './fakePage';

/**
 * Uma página em que só os jeitos de achar nomeados respondem, cada um com quantos acha.
 */
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
   * "Cupom" nomeava tanto um campo quanto o botão "Aplicar cupom", e um preenchimento
   * achava o botão primeiro: a run não digitava nada e clicava em Aplicar com o cupom
   * vazio.
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

  /** Três botões "Comprar", um por produto: o agente nomeia o que quer pelo número. */
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

  /**
   * O agente copiou o controle do jeito que o look o lista, "button: Entrar", que não é o
   * nome dele.
   */
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
   * O link "Entrar" do menu e o botão "Entrar" do formulário: o look os numera #1 e #2 na
   * ordem da página, e "Entrar #2" tem que ser o botão, não o segundo de qualquer papel
   * que veio primeiro.
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
