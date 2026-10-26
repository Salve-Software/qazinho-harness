/** Reads `emulator -list-avds`. The tool prefixes warnings with `INFO` and the like. */
export function parseAvds(stdout: string): string[] {
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[\w.-]+$/.test(line));
}
