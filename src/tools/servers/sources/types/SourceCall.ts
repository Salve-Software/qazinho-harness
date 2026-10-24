/** A source tool call as QAzinho carries it out: a story by its key, a search of Confluence by words, or a page by its id. */
export type SourceCall =
  | { name: 'read_jira_story'; key: string }
  | { name: 'search_confluence'; query: string }
  | { name: 'read_confluence_page'; pageId: string };
