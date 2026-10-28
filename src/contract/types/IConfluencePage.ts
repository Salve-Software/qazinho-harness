import type { IConfluencePageRef } from './IConfluencePageRef';

/**
 * Uma página do Confluence lida para o agente planejar a partir dela: onde está, e o
 * corpo em Markdown.
 */
export interface IConfluencePage {
  page: IConfluencePageRef;
  text: string;
}
