import { describe, expect, it } from 'vitest';
import { pagesOf } from '@/engine/devices/WebDriver/library';

const HOME = 'https://loja.test/';

describe('pagesOf', () => {
  it('keeps the pages the menu leads to on the same site, in order, once each', () => {
    expect(
      pagesOf({
        current: HOME,
        hrefs: [
          'https://loja.test/produtos',
          '/carrinho',
          'https://loja.test/produtos#topo',
          'https://loja.test/entrar',
        ],
      }),
    ).toEqual([
      'https://loja.test/produtos',
      'https://loja.test/carrinho',
      'https://loja.test/entrar',
    ]);
  });

  it('leaves out the page it is on, an anchor to it, and other sites', () => {
    expect(
      pagesOf({
        current: HOME,
        hrefs: ['/', '#novidades', 'https://instagram.com/loja', 'mailto:oi@loja.test'],
      }),
    ).toEqual([]);
  });

  /** Opening a link is a GET, and some apps sign out or delete on one. */
  it('never follows a link that signs out or deletes', () => {
    expect(
      pagesOf({
        current: HOME,
        hrefs: ['/sair', '/logout', '/conta/excluir', '/items/9/delete', '/blog'],
      }),
    ).toEqual(['https://loja.test/blog']);
  });

  it('gives nothing when the page it is on is not a URL', () => {
    expect(pagesOf({ current: 'about:blank?', hrefs: ['/produtos'] })).toEqual([]);
  });
});
