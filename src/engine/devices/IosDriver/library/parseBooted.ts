/** Reads `xcrun simctl list devices`. Only a booted simulator can be driven. */
export function parseBooted(listed: string): string[] {
  return [...listed.matchAll(/\(([0-9A-F-]{36})\)\s*\(Booted\)/gi)].map(
    ([, udid]) => udid ?? '',
  );
}
