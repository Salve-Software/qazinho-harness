/**
 * Numera os controles que dizem o mesmo, #1, #2… na ordem da página qualquer que seja o
 * papel, para o agente nomear o que quer.
 */
export function numberDuplicates(lines: string[]): string[] {
  const totals = new Map<string, number>();
  const seen = new Map<string, number>();

  for (const line of lines)
    totals.set(wordsOf(line), (totals.get(wordsOf(line)) ?? 0) + 1);

  return lines.map((line) => {
    const words = wordsOf(line);

    if (totals.get(words) === 1) return line;

    const number = (seen.get(words) ?? 0) + 1;

    seen.set(words, number);

    return `${line} #${String(number)}`;
  });
}

function wordsOf(line: string): string {
  const at = line.indexOf(': ');

  return (at === -1 ? line : line.slice(at + 2)).toLowerCase();
}
