import type { IHarnessSection } from '@/context/types';
import type { IConfluencePage } from '@/contract';
import { PAGE_SECTION } from '@/constants';

/** A Confluence page as the planning agent reads it: its title, space and address, then its text indented, so it can neither start a section nor close QAzinho's block. */
export function describePage(read: IConfluencePage | null): IHarnessSection {
  if (read === null) return { title: PAGE_SECTION.title, lines: [] };

  const { page, text } = read;
  const body =
    text.length > PAGE_SECTION.textChars
      ? `${text.slice(0, PAGE_SECTION.textChars)}\n(the rest is cut)`
      : text;

  return {
    title: PAGE_SECTION.title,
    lines: [
      `${page.title}${page.space === '' ? '' : ` · ${page.space}`}`,
      page.url,
      ...(body.trim() === ''
        ? ['The page is empty.']
        : [
            'Its text:',
            ...body
              .replace(/<\/?qazinho>/gi, '[qazinho]')
              .split('\n')
              .map((line) => `  ${line}`),
          ]),
    ],
  };
}
