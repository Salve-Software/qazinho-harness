import type { SourceCall } from './SourceCall';

/** Who fetches a Jira story or a Confluence page for the chat, under the scope its address carries, through the QA's own account, and answers in words. */
export interface IAttachSources {
  scope: string;
  fetch: (call: SourceCall) => Promise<{ text: string; isError: boolean }>;
}
