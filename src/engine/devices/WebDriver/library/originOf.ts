/**
 * A origem em cujo armazenamento uma página escreve, só para uma página web: about:blank,
 * data: e o resto não guardam nada.
 */
export function originOf(url: string): string | null {
  try {
    const parsed = new URL(url);

    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}
