import type { SourceCall } from './SourceCall';

/**
 * Quem busca uma story do Jira ou uma página do Confluence para o chat, no escopo que o
 * endereço traz, pela conta do próprio QA, e responde em palavras.
 */
export interface IAttachSources {
  scope: string;
  fetch: (call: SourceCall) => Promise<{ text: string; isError: boolean }>;
}
