const KEY = /\b([A-Za-z][A-Za-z0-9_]*-\d+)\b/;

/** The key of a Jira issue in what the agent was given, a bare key or a link to the issue, in capitals; null when there is none. */
export function jiraKeyOf(text: string): string | null {
  const fromLink = /(?:\/browse\/|selectedIssue=)([A-Za-z][A-Za-z0-9_]*-\d+)/.exec(text);
  const found = fromLink ?? KEY.exec(text);

  return found?.[1]?.toUpperCase() ?? null;
}
