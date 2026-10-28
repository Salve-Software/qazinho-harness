/** The things a step's proof holds, one per line, each of which the screen must show. */
export function proofLinesOf(proof: string): string[] {
  return proof
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
