function wordsOf(line: string): string {
  const at = line.indexOf(': ');

  return (at === -1 ? line : line.slice(at + 2)).toLowerCase();
}

/** Numbers the controls that read alike, #1, #2… in page order whatever their role, so the agent can name the one it means. */
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
