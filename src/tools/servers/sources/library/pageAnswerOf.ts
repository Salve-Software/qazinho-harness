import type { IConfluencePage } from '@/contract';
import { describePage, renderSections } from '@/context/library';

/**
 * Uma página lida pela própria chamada do agente, com as mesmas palavras com que o
 * /confluence a entrega.
 */
export function pageAnswerOf(page: IConfluencePage): string {
  return renderSections([describePage(page)]);
}
