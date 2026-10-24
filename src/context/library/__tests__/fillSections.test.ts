import { describe, expect, it } from 'vitest';
import { fillSections } from '@/context/library';

describe('fillSections', () => {
  it('puts every placeholder in its value', () => {
    expect(
      fillSections({
        sections: [{ title: 'Device', lines: ['The app is {{app}}.', 'Again {{app}}'] }],
        values: { app: 'https://shop.test' },
      }),
    ).toEqual([
      {
        title: 'Device',
        lines: ['The app is https://shop.test.', 'Again https://shop.test'],
      },
    ]);
  });

  it('leaves a section with no placeholder as it was', () => {
    const sections = [{ title: 'T', lines: ['Plain {braces} stay'] }];

    expect(fillSections({ sections, values: {} })).toEqual(sections);
  });

  it('throws on a placeholder nothing fills, so a corpus typo never reaches the agent', () => {
    expect(() =>
      fillSections({
        sections: [{ title: 'Device', lines: ['{{ap}}'] }],
        values: { app: 'x' },
      }),
    ).toThrow('{{ap}}');
  });
});
