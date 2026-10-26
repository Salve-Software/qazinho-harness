import { describe, expect, it } from 'vitest';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { describePage } from '@/engine/devices/WebDriver/library';
import { fakePage } from './fakePage';

function pageShowing(props: { text: string; controls: string[] }) {
  return fakePage({
    url: () => 'https://shop.test/cart',
    title: () => Promise.resolve('Cart'),
    locator: () => ({ innerText: () => Promise.resolve(props.text) }),
    $$eval: () =>
      Promise.resolve(
        props.controls.map((line, at) => {
          const [role = '', label = ''] = line.split(': ');

          return { role, label, at };
        }),
      ),
  });
}

describe('describePage', () => {
  it('tells the agent where it is, what it reads and what it can touch', async () => {
    const page = pageShowing({
      text: 'Your cart is empty',
      controls: ['button: Checkout'],
    });

    expect(await describePage(page)).toBe(
      [
        'URL: https://shop.test/cart',
        'TITLE: Cart',
        'TEXT:',
        'Your cart is empty',
        'CONTROLS:',
        'button: Checkout',
      ].join('\n'),
    );
  });

  it('numbers a menu link and a form button that read alike, in the order they show', async () => {
    const page = pageShowing({
      text: 'Entrar',
      controls: ['a: Entrar', 'button: Entrar'],
    });

    expect(await describePage(page)).toContain('a: Entrar #1\nbutton: Entrar #2');
  });

  it('a page longer than the limit is cut, so one screen never eats the context', async () => {
    const page = pageShowing({
      text: 'x'.repeat(WEB_DRIVER.pageTextLimit + 500),
      controls: [],
    });
    const described = await describePage(page);

    expect(described).toContain('x'.repeat(WEB_DRIVER.pageTextLimit));
    expect(described).not.toContain('x'.repeat(WEB_DRIVER.pageTextLimit + 1));
  });

  it('a run of blank lines collapses, because the agent reads them as nothing', async () => {
    const page = pageShowing({ text: 'top\n\n\n\n\nbottom', controls: [] });

    expect(await describePage(page)).toContain('top\n\nbottom');
  });

  it('a page that refuses to be read is still described by its url', async () => {
    const page = fakePage({
      url: () => 'about:blank',
      title: () => Promise.resolve(''),
      locator: () => ({ innerText: () => Promise.reject(new Error('detached')) }),
      $$eval: () => Promise.reject(new Error('detached')),
    });

    expect(await describePage(page)).toBe(
      'URL: about:blank\nTITLE: \nTEXT:\n\nCONTROLS:',
    );
  });
});
