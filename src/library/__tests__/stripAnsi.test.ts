import { describe, expect, it } from 'vitest';
import { stripAnsi } from '@/library';

const ESC = String.fromCharCode(27);

describe('stripAnsi', () => {
  it('drops the colour codes a Playwright error carries', () => {
    expect(stripAnsi(`${ESC}[2m- waiting for element${ESC}[22m`)).toBe(
      '- waiting for element',
    );
  });

  it('leaves text without codes as it was, brackets included', () => {
    expect(stripAnsi('Click [Add to cart]')).toBe('Click [Add to cart]');
  });
});
