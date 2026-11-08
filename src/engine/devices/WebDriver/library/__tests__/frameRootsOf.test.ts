import type { Page } from 'playwright-core';
import { describe, expect, it } from 'vitest';
import { frameRootsOf } from '@/engine/devices/WebDriver/library';

type Place = { isShown: boolean; selector: string; name: string | null };

/**
 * Um iframe falso: onde ele está na página de cima, e os iframes dentro dele.
 */
function fakeFrame(props: { place: Place | null; url?: string; children?: unknown[] }) {
  return {
    url: () => props.url ?? 'http://127.0.0.1:5173/chat',
    childFrames: () => props.children ?? [],
    frameElement: () =>
      Promise.resolve(
        props.place === null ? null : { evaluate: () => Promise.resolve(props.place) },
      ),
  };
}

/** Uma raiz que guarda o caminho que um locator percorreu até ela. */
function fakeRoot(path: string): unknown {
  return {
    path,
    locator: (selector: string) => ({
      contentFrame: () => fakeRoot(`${path} > ${selector}`),
    }),
  };
}

function pageWith(children: unknown[]): Page {
  return {
    ...(fakeRoot('page') as object),
    mainFrame: () => ({ childFrames: () => children }),
  } as unknown as Page;
}

const pathOf = (root: unknown) => (root as { path: string }).path;

describe('frameRootsOf', () => {
  /**
   * Um construtor de telas roda num iframe de outro site dentro do app: o agente via só
   * uma caixa vazia no lugar dele, e abriu um bug falso dizendo que a tela não mudou.
   */
  it('reaches a shown iframe through its title, after the page', async () => {
    const roots = await frameRootsOf(
      pageWith([
        fakeFrame({
          place: { isShown: true, selector: 'iframe[title="Builder"]', name: 'Builder' },
        }),
      ]),
    );

    expect(roots.map(({ name }) => name)).toEqual([null, 'Builder']);
    expect(pathOf(roots[1]?.root)).toBe('page > iframe[title="Builder"]');
  });

  it('chains an iframe inside another iframe', async () => {
    const inner = fakeFrame({
      place: { isShown: true, selector: 'iframe >> nth=0', name: null },
      url: 'http://localhost:5173/flows',
    });
    const roots = await frameRootsOf(
      pageWith([
        fakeFrame({
          place: { isShown: true, selector: 'iframe[title="Builder"]', name: 'Builder' },
          children: [inner],
        }),
      ]),
    );

    expect(pathOf(roots[2]?.root)).toBe(
      'page > iframe[title="Builder"] > iframe >> nth=0',
    );
    expect(roots[2]?.name).toBe('localhost:5173');
  });

  it('leaves out an iframe nobody sees, or one already gone', async () => {
    const roots = await frameRootsOf(
      pageWith([
        fakeFrame({ place: { isShown: false, selector: 'iframe >> nth=0', name: null } }),
        fakeFrame({ place: null }),
      ]),
    );

    expect(roots).toHaveLength(1);
  });

  it('keeps just the page when it cannot list frames', async () => {
    expect(await frameRootsOf({} as Page)).toHaveLength(1);
  });
});
