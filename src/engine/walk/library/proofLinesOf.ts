/**
 * As coisas que a prova de um passo contém, uma por linha, cada uma das quais a tela
 * precisa mostrar.
 */
export function proofLinesOf(proof: string): string[] {
  return proof
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
