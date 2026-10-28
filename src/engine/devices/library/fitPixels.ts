/**
 * Um tamanho reduzido, mantendo a forma, até caber em no máximo `maxPixels`; um que já
 * cabe fica como está.
 */
export function fitPixels(props: { width: number; height: number; maxPixels: number }): {
  width: number;
  height: number;
} {
  const { width, height, maxPixels } = props;
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));

  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
