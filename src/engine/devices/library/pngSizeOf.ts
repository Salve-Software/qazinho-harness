const SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

/**
 * A largura e a altura que um PNG diz ter, pelo cabeçalho; null quando os bytes não são
 * um PNG.
 */
export function pngSizeOf(image: Buffer): { width: number; height: number } | null {
  if (image.length < 24 || SIGNATURE.some((byte, index) => image[index] !== byte))
    return null;

  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
}
