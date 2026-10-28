/** Lê o `emulator -list-avds`. A ferramenta põe `INFO` e afins na frente dos avisos. */
export function parseAvds(stdout: string): string[] {
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[\w.-]+$/.test(line));
}
