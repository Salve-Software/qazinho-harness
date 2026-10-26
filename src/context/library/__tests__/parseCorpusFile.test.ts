import { describe, expect, it } from 'vitest';
import { parseCorpusFile } from '@/context/library';

const BODY = '---\norder: 20\n---\n\n## Who you are\n\nLine one\nline two\n';

describe('parseCorpusFile', () => {
  it('reads the layer and the scope out of where the file lives', () => {
    expect(
      parseCorpusFile({ path: '/src/harness/context/corpus/universal/x.md', text: BODY }),
    ).toMatchObject({ layer: 'universal', scope: null });
    expect(
      parseCorpusFile({ path: '/src/harness/context/corpus/role/chat/x.md', text: BODY }),
    ).toMatchObject({ layer: 'role', scope: 'chat' });
    expect(
      parseCorpusFile({
        path: '/src/harness/context/corpus/platform/android.md',
        text: BODY,
      }),
    ).toMatchObject({ layer: 'platform', scope: 'android' });
  });

  it('keeps the body line by line, with no blank line around it', () => {
    expect(parseCorpusFile({ path: 'corpus/universal/x.md', text: BODY })).toMatchObject({
      order: 20,
      section: { title: 'Who you are', lines: ['Line one', 'line two'] },
    });
  });

  it('puts a file with no frontmatter first in its layer, read by every role', () => {
    expect(
      parseCorpusFile({ path: 'corpus/universal/x.md', text: '## T\nA' }),
    ).toMatchObject({ order: 0, except: [] });
  });

  it('reads the roles a file is never read by', () => {
    expect(
      parseCorpusFile({
        path: 'corpus/universal/x.md',
        text: '---\norder: 30\nexcept: [reader, 3]\n---\n## T\nA',
      }).except,
    ).toEqual(['reader']);
  });

  it('refuses a file outside the three layers, or a role with no folder', () => {
    expect(() => parseCorpusFile({ path: 'corpus/account/x.md', text: BODY })).toThrow(
      'universal/',
    );
    expect(() => parseCorpusFile({ path: 'corpus/role/x.md', text: BODY })).toThrow(
      'role/<role>',
    );
  });

  it('refuses a file that does not open with its title', () => {
    expect(() =>
      parseCorpusFile({ path: 'corpus/universal/x.md', text: 'No title\nhere' }),
    ).toThrow('## Title');
  });
});
