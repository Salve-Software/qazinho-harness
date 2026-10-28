import { proofLinesOf } from './proofLinesOf';

/**
 * A prova de um passo que passou com cada valor que o resultado esperado nomeia, que a
 * tela mostra e a prova deixou de fora, numa linha própria.
 */
export function proofWithValues(props: {
  proof: string;
  values: string[];
  screen: string;
}): string {
  const lines = proofLinesOf(props.proof);
  const screen = plain(props.screen);
  const added = props.values.filter(
    (value) =>
      screen.includes(plain(value)) &&
      !lines.some((line) => plain(line).includes(plain(value))),
  );

  return [...lines, ...added].join('\n');
}

function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}
