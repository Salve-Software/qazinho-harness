/** Lê o `xcrun simctl list devices`. Só um simulador ligado pode ser dirigido. */
export function parseBooted(listed: string): string[] {
  return [...listed.matchAll(/\(([0-9A-F-]{36})\)\s*\(Booted\)/gi)].map(
    ([, udid]) => udid ?? '',
  );
}
