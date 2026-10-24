/** A Confluence page as QAzinho points at it: its id, its title, the space it is in, and where it opens. */
export interface IConfluencePageRef {
  id: string;
  title: string;
  space: string;
  url: string;
}
