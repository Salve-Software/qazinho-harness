import { describe, expect, it } from 'vitest';
import { confluencePageIdOf } from '@/tools/servers/sources/library';

describe('confluencePageIdOf', () => {
  it('reads the id in a bare id, a page link, or an older viewpage link', () => {
    expect(confluencePageIdOf('123456')).toBe('123456');
    expect(
      confluencePageIdOf(
        'https://acme.atlassian.net/wiki/spaces/QA/pages/123456/Checkout',
      ),
    ).toBe('123456');
    expect(
      confluencePageIdOf(
        'https://acme.atlassian.net/wiki/pages/viewpage.action?pageId=987',
      ),
    ).toBe('987');
  });

  it('does NOT take a title for an id', () => {
    expect(confluencePageIdOf('CT-CHK Checkout com cupom SHOP-878')).toBeNull();
  });
});
