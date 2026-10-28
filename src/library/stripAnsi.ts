const ESCAPE = String.fromCharCode(27);
const COLOURS = new RegExp(`${ESCAPE}\\[[0-9;]*[A-Za-z]`, 'g');

/**
 * O Playwright colore os erros para um terminal; na tela esses códigos aparecem como
 * "[22m".
 */
export function stripAnsi(text: string): string {
  return text.replace(COLOURS, '');
}
