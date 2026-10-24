import { describe, expect, it } from 'vitest';
import { textNamed } from '@/tools/library';

const TEXT = textNamed({ message: 'Say it.', description: 'What to say.' });

describe('textNamed', () => {
  it('takes a text, trimmed', () => {
    expect(TEXT.parse('  hi ')).toBe('hi');
  });

  it('says the same thing back whether the text is missing, blank or not a text', () => {
    for (const value of [undefined, '   ', 42])
      expect(TEXT.safeParse(value).error?.issues[0]?.message).toBe('Say it.');
  });
});
