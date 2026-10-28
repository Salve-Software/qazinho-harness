/**
 * A entrada de uma chamada de ferramenta como os argumentos que as ferramentas do
 * dispositivo leem: um objeto, ou nenhum.
 */
export function argsOf(input: unknown): Record<string, unknown> | undefined {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : undefined;
}
