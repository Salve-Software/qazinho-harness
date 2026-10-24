/** The id of a Confluence page in what the agent was given, a bare id or a link to the page; null when there is none. */
export function confluencePageIdOf(text: string): string | null {
  const trimmed = text.trim();

  if (/^\d+$/.test(trimmed)) return trimmed;

  return /(?:\/pages\/|pageId=)(\d+)/.exec(trimmed)?.[1] ?? null;
}
