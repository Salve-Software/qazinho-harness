const RGB =
  /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i;

/**
 * Uma cor como um arquivo de design a escreve: `#1F6FEB`, com a opacidade quando tem, ou
 * "transparent"; qualquer outra notação fica como o navegador a escreveu.
 */
export function hexOfColor(color: string): string {
  const read = RGB.exec(color.trim());

  if (!read) return color.trim();

  const [, red = '0', green = '0', blue = '0', alpha] = read;
  const opacity =
    alpha === undefined
      ? 1
      : alpha.endsWith('%')
        ? Number(alpha.slice(0, -1)) / 100
        : Number(alpha);

  if (opacity === 0) return 'transparent';

  const code = `#${hex(red)}${hex(green)}${hex(blue)}`;

  return opacity >= 1 ? code : `${code} at ${String(Math.round(opacity * 100))}%`;
}

function hex(channel: string): string {
  return Math.round(Math.min(255, Number(channel)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}
