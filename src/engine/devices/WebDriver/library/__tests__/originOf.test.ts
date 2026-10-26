import { describe, expect, it } from 'vitest';
import { originOf } from '@/engine/devices/WebDriver/library';

describe('originOf', () => {
  it('keeps the scheme, host and port of a web page, and drops the rest', () => {
    expect(originOf('http://127.0.0.1:4310/carrinho?x=1#top')).toBe(
      'http://127.0.0.1:4310',
    );
    expect(originOf('https://shop.test/')).toBe('https://shop.test');
  });

  it('a blank tab, a data URL or a Chrome page keeps no storage worth clearing', () => {
    expect(originOf('about:blank')).toBeNull();
    expect(originOf('data:text/html,<p>hi</p>')).toBeNull();
    expect(originOf('chrome-error://chromewebdata/')).toBeNull();
  });

  it('a string that is not a URL has no origin', () => {
    expect(originOf('')).toBeNull();
    expect(originOf('shop.test')).toBeNull();
  });
});
