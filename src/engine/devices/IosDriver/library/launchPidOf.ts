/**
 * O pid que o `simctl launch` imprime como "<bundle>: <pid>"; null quando não há número,
 * e então o QAzinho não consegue dizer se o app ficou em primeiro plano.
 */
export function launchPidOf(output: string): number | null {
  const match = output.trim().match(/(\d+)\s*$/);

  return match === null ? null : Number(match[1]);
}
