const PATTERNS = [
  /(?:R\$|US\$|\$|€|£)\s?\d+(?:[.,]\d+)*/g,
  /\d+(?:[.,]\d+)?\s?%/g,
  /\b\d+[.,]\d{2}\b/g,
];
const QUOTED = /["“]([^"”\n]{2,80})["”]/g;

/**
 * The values a step's expected result names, in its order: prices, percentages and the
 * words it quotes, none inside another.
 */
export function expectedValuesOf(expected: string): string[] {
  const found = [
    ...PATTERNS.flatMap((pattern) =>
      [...expected.matchAll(pattern)].map((match) => ({
        at: match.index,
        value: match[0].trim(),
      })),
    ),
    ...[...expected.matchAll(QUOTED)].map((match) => ({
      at: match.index,
      value: (match[1] ?? '').trim(),
    })),
  ].sort((a, b) => a.at - b.at);
  const values = found.map(({ value }) => value).filter((value) => value.length > 0);

  return values.filter(
    (value, index) =>
      values.indexOf(value) === index &&
      !values.some((other) => other !== value && other.includes(value)),
  );
}
