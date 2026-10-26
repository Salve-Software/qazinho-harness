/** A size scaled down, keeping its shape, until it holds at most `maxPixels`; one that already fits stays as it is. */
export function fitPixels(props: { width: number; height: number; maxPixels: number }): {
  width: number;
  height: number;
} {
  const { width, height, maxPixels } = props;
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));

  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
