/**
 * Lê o `xcrun simctl list devices available`, o runtime mais novo por último, iPhones
 * antes de iPads.
 */
export function parseSimulators(listed: string): string[] {
  const phones = [...listed.matchAll(/^\s*(iPhone[^(]*)\(([0-9A-F-]{36})\)/gim)];

  return phones.map(([, , udid]) => udid ?? '');
}
