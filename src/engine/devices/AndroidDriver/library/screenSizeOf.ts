/**
 * O tamanho em que a tela de um emulador aparece, pelo `wm size`: uma sobrescrita do QA
 * vence o tamanho físico.
 */
export function screenSizeOf(printed: string): { width: number; height: number } | null {
  const sizes = [...printed.matchAll(/(Physical|Override) size:\s*(\d+)x(\d+)/g)].map(
    ([, kind, width, height]) => ({ kind, width: Number(width), height: Number(height) }),
  );
  const shown = sizes.find(({ kind }) => kind === 'Override') ?? sizes[0];

  return shown === undefined ? null : { width: shown.width, height: shown.height };
}
