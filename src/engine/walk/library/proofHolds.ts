import { proofLinesOf } from './proofLinesOf';

/**
 * Whether the screen still shows every line of the words that proved a step, read the way
 * a person would: case and spacing aside.
 */
export function proofHolds(props: { screen: string; proof: string }): boolean {
  const screen = plain(props.screen);
  const lines = proofLinesOf(props.proof).map(plain);

  return lines.length > 0 && lines.every((line) => screen.includes(line));
}

function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}
