const SHELL_CHARACTERS = /[\\'`$&|;<>()*?[\]{}~#!]/g;

/**
 * Um texto como as chamadas de `adb shell input text` que o digitam, escapado para o
 * shell do celular, com espaços como %s.
 */
export function adbTextsOf(text: string): string[] {
  const parts = text.split('%s');

  return parts
    .map((part, index) =>
      `${index > 0 ? 's' : ''}${part}${index < parts.length - 1 ? '%' : ''}`
        .replace(SHELL_CHARACTERS, (char) => `\\${char}`)
        .replace(/ /g, '%s'),
    )
    .filter((chunk) => chunk.length > 0);
}
