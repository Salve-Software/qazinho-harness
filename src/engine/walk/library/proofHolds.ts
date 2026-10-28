import { proofLinesOf } from './proofLinesOf';

/**
 * Se a tela ainda mostra cada linha das palavras que provaram um passo, lida como uma
 * pessoa leria: sem ligar para maiúsculas e espaços.
 */
export function proofHolds(props: { screen: string; proof: string }): boolean {
  const screen = plain(props.screen);
  const lines = proofLinesOf(props.proof).map(plain);

  return lines.length > 0 && lines.every((line) => screen.includes(line));
}

function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}
