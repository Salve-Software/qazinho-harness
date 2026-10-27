import type { IConfluencePageRef } from '@/contract';

/**
 * The pages a search of Confluence found, each with the id to read it by; none found says
 * so, and what to do.
 */
export function pagesFoundOf(props: {
  query: string;
  pages: IConfluencePageRef[];
}): string {
  if (props.pages.length === 0)
    return `Confluence has no page whose title matches "${props.query}". Search again with fewer or other words, or ask the QA for the page's link.`;

  return [
    `Pages whose title matches "${props.query}":`,
    ...props.pages.map(
      (page) =>
        `- ${page.id} · ${page.title}${page.space === '' ? '' : ` · ${page.space}`}`,
    ),
    'Read the one the QA means with read_confluence_page and its id; when more than one fits, ask the QA which.',
  ].join('\n');
}
