import { proofLinesOf } from './proofLinesOf';

/**
 * A passed step's proof with each value its expected result names that the screen shows
 * and the proof left out, as a line of its own.
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
