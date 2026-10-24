import { describe, expect, it } from 'vitest';
import { jiraKeyOf } from '@/tools/servers/sources/library';

describe('jiraKeyOf', () => {
  it('reads the key in a bare key, a link to the issue, or a board link', () => {
    expect(jiraKeyOf('HC-878')).toBe('HC-878');
    expect(jiraKeyOf('hc-878')).toBe('HC-878');
    expect(jiraKeyOf('https://ploomes.atlassian.net/browse/HC-878')).toBe('HC-878');
    expect(
      jiraKeyOf(
        'https://ploomes.atlassian.net/jira/software/projects/HC/boards/1?selectedIssue=HC-12',
      ),
    ).toBe('HC-12');
  });

  it('does NOT find a key in words with no number', () => {
    expect(jiraKeyOf('the checkout story')).toBeNull();
    expect(jiraKeyOf('')).toBeNull();
  });
});
