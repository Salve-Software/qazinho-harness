/**
 * Uma chamada de ferramenta de fonte como o QAzinho a executa: uma story pela chave, uma
 * busca no Confluence por palavras, ou uma página pelo id.
 */
export type SourceCall =
  | { name: 'read_jira_story'; key: string }
  | { name: 'search_confluence'; query: string }
  | { name: 'read_confluence_page'; pageId: string };
