import { describe, expect, it } from 'vitest';
import { findLocator } from '@/engine/devices/WebDriver/library';
import { fakeLocator, fakePage, locatorName } from './fakePage';

/**
 * Uma página em que só os jeitos de achar nomeados respondem, cada um com quantos acha.
 */
function pageWith(found: Record<string, number>, unreached: string[] = []) {
  const answer = (name: string) =>
    fakeLocator({ name, count: found[name] ?? 0, isReached: !unreached.includes(name) });
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
    getByTestId: () => answer('testid'),
    locator: (selector: string) =>
      answer(selector.startsWith('[') ? `css:${selector}` : 'css'),
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

  /**
   * Uma lista de produtos: a aba "Etiqueta" ao lado do botão "Nova etiqueta de produto".
   * O botão que contém a palavra vinha antes da aba com o nome exato.
   */
  it('takes a tab named exactly before a button that holds the name', async () => {
    const page = pageWith({ 'role:button': 1, 'role:tab:exact': 1, 'role:tab': 1 });

    expect(
      locatorName(await findLocator({ page, target: 'Etiqueta', kind: 'click' })),
    ).toBe('role:tab:exact');
  });

  it('takes words shown exactly before a control that holds them', async () => {
    const page = pageWith({ 'role:button': 1, 'text:exact': 1, text: 2 });

    expect(
      locatorName(await findLocator({ page, target: 'Etiqueta', kind: 'click' })),
    ).toBe('text:exact');
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
      getByRole: (role: string) => fakeLocator({ name: `role:${role}`, count: 1 }),
      locator: () => ({
        nth: (index: number) =>
          fakeLocator({ name: `listed@${String(index)}`, count: 1 }),
      }),
    });

    expect(
      locatorName(await findLocator({ page, target: 'Entrar #2', kind: 'click' })),
    ).toBe('role:button');
    expect(
      locatorName(await findLocator({ page, target: 'entrar #1', kind: 'click' })),
    ).toBe('role:link');
  });

  /**
   * Seis botões "Adicionar ao carrinho": gravado como o 5º controle da página, um teste do
   * Playwright exportado quebrava com um link novo no topo, e ninguém o lia.
   */
  it('names a numbered control by its role and its place among its namesakes', async () => {
    const buttons = Array.from({ length: 6 }, (_, index) => ({
      role: 'button',
      label: 'Adicionar ao carrinho',
      at: 4 + index,
    }));
    const page = fakePage({
      $$eval: () => Promise.resolve(buttons),
      getByRole: (role: string) => fakeLocator({ name: `role:${role}`, count: 6 }),
      locator: () => ({
        nth: (index: number) =>
          fakeLocator({ name: `listed@${String(index)}`, count: 1 }),
      }),
    });

    expect(
      locatorName(
        await findLocator({ page, target: 'Adicionar ao carrinho #6', kind: 'click' }),
      ),
    ).toBe('role:button#6');
  });

  it('falls back to the place among all controls when the role finds another count', async () => {
    const page = fakePage({
      $$eval: () =>
        Promise.resolve([
          { role: 'button', label: 'Comprar', at: 2 },
          { role: 'button', label: 'Comprar', at: 5 },
        ]),
      getByRole: (role: string) => fakeLocator({ name: `role:${role}`, count: 3 }),
      locator: () => ({
        nth: (index: number) =>
          fakeLocator({ name: `listed@${String(index)}`, count: 1 }),
      }),
    });

    expect(
      locatorName(await findLocator({ page, target: 'Comprar #2', kind: 'click' })),
    ).toBe('listed@5');
  });

  /**
   * "Carrinho4" é o carrinho com quatro itens: outro número na tela quer dizer que o app
   * está diferente, e a busca não pode fingir que é o mesmo controle.
   */
  it('does NOT take another number for the one the target names', async () => {
    const page = fakePage({
      getByRole: (_: string, options?: { name?: string | RegExp }) =>
        fakeLocator({ name: 'role', count: options?.name instanceof RegExp ? 1 : 0 }),
      getByLabel: () => fakeLocator({ name: 'label', count: 0 }),
      getByPlaceholder: () => fakeLocator({ name: 'placeholder', count: 0 }),
      getByText: (name: string | RegExp) =>
        fakeLocator({ name: 'text', count: name instanceof RegExp ? 1 : 0 }),
      getByTestId: () => fakeLocator({ name: 'testid', count: 0 }),
      locator: () => fakeLocator({ name: 'css', count: 0 }),
    });

    expect(await findLocator({ page, target: 'Carrinho4', kind: 'click' })).toBeNull();
  });

  it('falls back to the usual search when the list has no such number', async () => {
    const page = pageWith({ 'role:button:exact': 3 });

    expect(
      locatorName(await findLocator({ page, target: 'Comprar #2', kind: 'click' })),
    ).toBe('role:button:exact#2');
  });

  /** O time deu ao campo um test id: ele continua achando o campo quando as palavras mudam. */
  it('takes a control by the test id the agent names, before any words', async () => {
    const page = pageWith({ testid: 1, 'label:exact': 1 });

    expect(
      locatorName(
        await findLocator({ page, target: 'testid=login-email', kind: 'fill' }),
      ),
    ).toBe('testid');
  });

  it('reads a test id kept in another attribute, such as data-cy', async () => {
    const page = pageWith({ 'css:[data-cy="login-email"]': 1 });

    expect(
      locatorName(
        await findLocator({ page, target: '[testid=login-email]', kind: 'click' }),
      ),
    ).toBe('css:[data-cy="login-email"]');
  });

  /**
   * O Haiku leu `[testid=login-email]` na página e preencheu `login-email`, sem o prefixo:
   * nada achava o campo, e ele caía no rótulo depois de duas ações perdidas.
   */
  it('takes a test id written without the prefix when no words match it', async () => {
    const page = pageWith({ testid: 1 });

    expect(
      locatorName(await findLocator({ page, target: 'login-email', kind: 'fill' })),
    ).toBe('testid');
  });

  it('keeps the words first when a bare name is also a label', async () => {
    const page = pageWith({ testid: 1, 'label:exact': 1 });

    expect(locatorName(await findLocator({ page, target: 'Email', kind: 'fill' }))).toBe(
      'label:exact',
    );
  });

  it('never reads words with spaces as a test id', async () => {
    const page = pageWith({ testid: 1 });

    expect(await findLocator({ page, target: 'Novo modelo', kind: 'click' })).toBeNull();
  });

  it('finds nothing for a test id the page does not have, rather than guessing', async () => {
    const page = pageWith({ 'label:exact': 1 });

    expect(await findLocator({ page, target: 'testid=gone', kind: 'fill' })).toBeNull();
  });

  /**
   * O botão mora num iframe: nada na página de cima responde a ele, e o locator achado
   * leva o caminho do iframe, que o código exportado repete.
   */
  it('finds a control inside an iframe when the page has none by that name', async () => {
    const inner = pageWith({ 'role:button:exact': 1 });
    const page = fakePage({
      ...(pageWith({}) as unknown as object),
      locator: () =>
        Object.assign(fakeLocator({ name: 'css', count: 0 }), {
          contentFrame: () => inner,
        }),
      mainFrame: () => ({
        childFrames: () => [
          {
            url: () => 'http://127.0.0.1:5173/',
            childFrames: () => [],
            frameElement: () =>
              Promise.resolve({
                evaluate: () =>
                  Promise.resolve({
                    isShown: true,
                    selector: 'iframe[title="Builder"]',
                    name: 'Builder',
                  }),
              }),
          },
        ],
      }),
    });

    expect(
      locatorName(await findLocator({ page, target: 'Nova etiqueta', kind: 'click' })),
    ).toBe('role:button:exact');
  });

  /**
   * Um menu de ícones cujo botão não tem exatamente o nome, e um tooltip transparente com as
   * palavras exatas: o clique caía no tooltip, respondia que tinha clicado e nada mudava.
   */
  it('passes over words no one could hit to the control that holds them', async () => {
    const page = pageWith({ 'text:exact': 1, 'role:button': 1 }, ['text:exact']);

    expect(
      locatorName(await findLocator({ page, target: 'Etiquetas', kind: 'click' })),
    ).toBe('role:button');
  });

  it('still takes what it found when nothing can be hit, rather than nothing', async () => {
    const page = pageWith({ 'text:exact': 1 }, ['text:exact']);

    expect(
      locatorName(await findLocator({ page, target: 'Etiquetas', kind: 'click' })),
    ).toBe('text:exact');
  });

  it('takes the next kind of control when the first cannot be hit', async () => {
    const page = pageWith({ 'role:button:exact': 1, 'role:link:exact': 2 }, [
      'role:button:exact',
    ]);

    expect(
      locatorName(await findLocator({ page, target: 'Comprar', kind: 'click' })),
    ).toBe('role:link:exact');
  });
});
