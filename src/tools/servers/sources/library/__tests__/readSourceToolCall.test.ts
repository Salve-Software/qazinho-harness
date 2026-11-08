import { describe, expect, it } from 'vitest';
import { readSourceToolCall } from '@/tools/servers/sources/library';

describe('readSourceToolCall', () => {
  it('reads a story by its link, a search by its words, and a page by its link', () => {
    expect(
      readSourceToolCall({
        name: 'read_jira_story',
        args: { story: 'https://acme.atlassian.net/browse/shop-878' },
      }),
    ).toEqual({ kind: 'call', call: { name: 'read_jira_story', key: 'SHOP-878' } });
    expect(
      readSourceToolCall({ name: 'search_confluence', args: { query: ' CT-CHK ' } }),
    ).toEqual({ kind: 'call', call: { name: 'search_confluence', query: 'CT-CHK' } });
    expect(
      readSourceToolCall({
        name: 'read_confluence_page',
        args: { page: 'https://acme.atlassian.net/wiki/spaces/QA/pages/42/CT' },
      }),
    ).toEqual({ kind: 'call', call: { name: 'read_confluence_page', pageId: '42' } });
  });

  /** O título de uma página passado onde vai o id leria outra página, ou nenhuma. */
  it('refuses a page named by its title, and points to the search', () => {
    const read = readSourceToolCall({
      name: 'read_confluence_page',
      args: { page: 'CT-CHK Checkout com cupom' },
    });

    expect(read).toMatchObject({ kind: 'refused' });
    expect(read.kind === 'refused' && read.error).toContain('search_confluence');
  });

  it('refuses a story with no key, a blank argument, and a tool it does not have', () => {
    expect(
      readSourceToolCall({ name: 'read_jira_story', args: { story: 'the tabs story' } }),
    ).toMatchObject({ kind: 'refused' });
    expect(readSourceToolCall({ name: 'search_confluence', args: {} })).toEqual({
      kind: 'refused',
      error: '"search_confluence" needs "query": words of the page\'s title.',
    });
    expect(readSourceToolCall({ name: 'open_url', args: {} })).toMatchObject({
      kind: 'refused',
    });
  });
});
