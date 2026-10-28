import type { IConfluencePageRef } from '@/contract';

/**
 * As páginas que uma busca no Confluence achou, cada uma com o id para lê-la; nenhuma
 * achada diz isso, e o que fazer.
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
