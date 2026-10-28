const KEY = /\b([A-Za-z][A-Za-z0-9_]*-\d+)\b/;

/**
 * A chave de uma issue do Jira no que o agente recebeu, uma chave pura ou um link para a
 * issue, em maiúsculas; null quando não há nenhuma.
 */
export function jiraKeyOf(text: string): string | null {
  const fromLink = /(?:\/browse\/|selectedIssue=)([A-Za-z][A-Za-z0-9_]*-\d+)/.exec(text);
  const found = fromLink ?? KEY.exec(text);

  return found?.[1]?.toUpperCase() ?? null;
}
