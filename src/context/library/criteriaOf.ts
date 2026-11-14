const MARK = /^\s*(?:[-*•]|\d+[.)]|[a-z][.)])\s+/i;

/**
 * Os critérios de aceite de uma história, um por item: as linhas que abrem com um
 * marcador ou um número, ou cada parágrafo quando o texto não tem nenhum.
 */
export function criteriaOf(acceptance: { field: string; text: string }[]): string[] {
  return acceptance.flatMap(({ text }) => itemsOf(text));
}

function itemsOf(text: string): string[] {
  const lines = text.split('\n');

  if (!lines.some((line) => MARK.test(line)))
    return text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter((paragraph) => paragraph.length > 0);

  const items: string[] = [];

  for (const line of lines) {
    if (MARK.test(line)) items.push(line.replace(MARK, '').trim());
    else if (line.trim().length > 0 && items.length > 0)
      items[items.length - 1] = `${items.at(-1) ?? ''} ${line.trim()}`;
  }

  return items.filter((item) => item.length > 0);
}
