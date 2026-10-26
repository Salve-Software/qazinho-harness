/** The size an emulator's screen shows at, from `wm size`: an override the QA set wins over the physical size. */
export function screenSizeOf(printed: string): { width: number; height: number } | null {
  const sizes = [...printed.matchAll(/(Physical|Override) size:\s*(\d+)x(\d+)/g)].map(
    ([, kind, width, height]) => ({ kind, width: Number(width), height: Number(height) }),
  );
  const shown = sizes.find(({ kind }) => kind === 'Override') ?? sizes[0];

  return shown === undefined ? null : { width: shown.width, height: shown.height };
}
