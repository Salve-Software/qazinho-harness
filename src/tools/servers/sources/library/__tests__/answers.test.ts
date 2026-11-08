import { describe, expect, it } from 'vitest';
import {
  pageAnswerOf,
  pagesFoundOf,
  sourceFailureOf,
} from '@/tools/servers/sources/library';

const PAGE = {
  id: '42',
  title: 'CT-CHK Checkout com cupom',
  space: 'QA',
  url: 'https://acme.atlassian.net/wiki/spaces/QA/pages/42',
};

describe('the source answers', () => {
  it('reads a page in the words /confluence uses', () => {
    expect(pageAnswerOf({ page: PAGE, text: 'CT01 · Abrir o preview' })).toBe(
      [
        '## The Confluence page',
        'CT-CHK Checkout com cupom · QA',
        PAGE.url,
        'Its text:',
        '  CT01 · Abrir o preview',
      ].join('\n'),
    );
  });

  it('lists the pages a search found with their ids, and says so when none matched', () => {
    expect(pagesFoundOf({ query: 'CT-CHK', pages: [PAGE] })).toContain(
      '- 42 · CT-CHK Checkout com cupom · QA',
    );
    expect(pagesFoundOf({ query: 'nada', pages: [] })).toContain('has no page');
  });

  it('says what the QA does when a source is off or refused', () => {
    expect(
      sourceFailureOf({ source: 'confluence', failure: 'off', subject: 'it' }),
    ).toContain("Jira's card");
    expect(
      sourceFailureOf({ source: 'jira', failure: 'not-found', subject: 'story SHOP-9' }),
    ).toBe(
      "Jira has no story SHOP-9, or the QA's account cannot see it. Ask the QA whether the key or the link is right.",
    );
  });
});
