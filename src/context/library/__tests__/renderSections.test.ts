import { describe, expect, it } from 'vitest';
import { renderSections } from '@/context/library';

describe('renderSections', () => {
  it('writes each section under its title, in order', () => {
    expect(
      renderSections([
        { title: 'Who you are', lines: ['A tester.', 'On this machine.'] },
        { title: 'The app', lines: ['https://shop.test'] },
      ]),
    ).toBe(
      '## Who you are\nA tester.\nOn this machine.\n\n## The app\nhttps://shop.test',
    );
  });

  it('leaves out a section with nothing to say', () => {
    expect(renderSections([{ title: 'Empty', lines: [] }])).toBe('');
  });
});
