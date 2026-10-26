/** A tool call's input as the arguments the device tools read: an object, or none. */
export function argsOf(input: unknown): Record<string, unknown> | undefined {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : undefined;
}
