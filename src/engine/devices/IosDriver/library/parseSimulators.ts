/** Reads `xcrun simctl list devices available`, newest runtime last, iPhones before iPads. */
export function parseSimulators(listed: string): string[] {
  const phones = [...listed.matchAll(/^\s*(iPhone[^(]*)\(([0-9A-F-]{36})\)/gim)];

  return phones.map(([, , udid]) => udid ?? '');
}
