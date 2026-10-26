/** The origin whose storage a page writes to, for a web page only: about:blank, data: and the rest keep none. */
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
