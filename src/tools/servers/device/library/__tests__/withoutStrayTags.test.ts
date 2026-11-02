import { describe, expect, it } from 'vitest';
import { withoutStrayTags } from '@/tools/servers/device/library/withoutStrayTags';

describe('withoutStrayTags', () => {
  /** O "Obtido" de um bug terminou num </got> literal, que iria para a issue do QA. */
  it('takes off a tag the agent closed and never opened', () => {
    expect(withoutStrayTags('O total mostra R$ 0,00</got>')).toBe(
      'O total mostra R$ 0,00',
    );
    expect(withoutStrayTags('O total mostra R$ 0,00\n</got>\n</report>')).toBe(
      'O total mostra R$ 0,00',
    );
  });

  it('keeps a tag the text talks about', () => {
    expect(withoutStrayTags('A página tem um <title>vazio</title>')).toBe(
      'A página tem um <title>vazio</title>',
    );
  });

  it('keeps text with no tag', () => {
    expect(withoutStrayTags('1 < 2 e nada mais')).toBe('1 < 2 e nada mais');
  });
});
