/** `plutil -extract CFBundleIdentifier raw` answers with the identifier and nothing else. */
export function bundleOfPlist(printed: string): string | null {
  const name = printed.trim().split('\n')[0]?.trim() ?? '';

  return /^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(name) ? name : null;
}
