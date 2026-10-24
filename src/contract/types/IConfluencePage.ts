import type { IConfluencePageRef } from './IConfluencePageRef';

/** A Confluence page read for the agent to plan from: where it is, and its body as Markdown. */
export interface IConfluencePage {
  page: IConfluencePageRef;
  text: string;
}
