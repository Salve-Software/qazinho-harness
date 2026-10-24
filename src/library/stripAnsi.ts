const ESCAPE = String.fromCharCode(27);
const COLOURS = new RegExp(`${ESCAPE}\\[[0-9;]*[A-Za-z]`, 'g');

/** Playwright colours its errors for a terminal; on screen those codes read as "[22m". */
export function stripAnsi(text: string): string {
  return text.replace(COLOURS, '');
}
