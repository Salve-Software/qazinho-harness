import { describe, expect, it } from 'vitest';
import { jiraKeyOf } from '@/tools/servers/sources/library';

describe('jiraKeyOf', () => {
  it('reads the key in a bare key, a link to the issue, or a board link', () => {
    expect(jiraKeyOf('SHOP-878')).toBe('SHOP-878');
    expect(jiraKeyOf('shop-878')).toBe('SHOP-878');
    expect(jiraKeyOf('https://acme.atlassian.net/browse/SHOP-878')).toBe('SHOP-878');
    expect(
      jiraKeyOf(
        'https://acme.atlassian.net/jira/software/projects/SHOP/boards/1?selectedIssue=SHOP-12',
      ),
    ).toBe('SHOP-12');
  });

  it('does NOT find a key in words with no number', () => {
    expect(jiraKeyOf('the checkout story')).toBeNull();
    expect(jiraKeyOf('')).toBeNull();
  });
});
