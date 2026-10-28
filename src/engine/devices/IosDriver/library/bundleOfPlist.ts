/**
 * O `plutil -extract CFBundleIdentifier raw` responde com o identificador e nada mais.
 */
export function bundleOfPlist(printed: string): string | null {
  const name = printed.trim().split('\n')[0]?.trim() ?? '';

  return /^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(name) ? name : null;
}
