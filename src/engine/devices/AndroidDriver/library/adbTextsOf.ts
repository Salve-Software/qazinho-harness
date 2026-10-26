const SHELL_CHARACTERS = /[\\'`$&|;<>()*?[\]{}~#!]/g;

/** A text as the `adb shell input text` calls that type it: each character the phone's shell would read escaped, each space as %s, and split where it holds %s, which input text would type as a space. */
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
