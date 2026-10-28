/**
 * O id de uma página do Confluence no que o agente recebeu, um id puro ou um link para a
 * página; null quando não há nenhum.
 */
export function confluencePageIdOf(text: string): string | null {
  const trimmed = text.trim();

  if (/^\d+$/.test(trimmed)) return trimmed;

  return /(?:\/pages\/|pageId=)(\d+)/.exec(trimmed)?.[1] ?? null;
}
