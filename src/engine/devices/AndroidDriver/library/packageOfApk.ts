/** O `aapt2 dump packagename` responde com o pacote e nada mais, numa linha. */
export function packageOfApk(dumped: string): string | null {
  const name = dumped.trim().split('\n')[0]?.trim() ?? '';

  return /^[a-zA-Z][\w.]*\.\w+$/.test(name) ? name : null;
}
