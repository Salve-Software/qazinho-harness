/** `aapt2 dump packagename` answers with the package and nothing else, one line. */
export function packageOfApk(dumped: string): string | null {
  const name = dumped.trim().split('\n')[0]?.trim() ?? '';

  return /^[a-zA-Z][\w.]*\.\w+$/.test(name) ? name : null;
}
