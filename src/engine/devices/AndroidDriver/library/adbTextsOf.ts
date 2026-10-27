const SHELL_CHARACTERS = /[\\'`$&|;<>()*?[\]{}~#!]/g;

/**
 * A text as the `adb shell input text` calls that type it, escaped for the phone's shell,
 * spaces as %s.
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
