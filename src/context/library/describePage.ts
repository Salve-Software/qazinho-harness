import type { IHarnessSection } from '@/context/types';
import type { IConfluencePage } from '@/contract';
import { PAGE_SECTION } from '@/constants';

/**
 * Uma página do Confluence como o agente que planeja a lê: título, espaço e endereço,
 * depois o texto indentado, para não abrir uma seção nem fechar o bloco do QAzinho.
 */
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
