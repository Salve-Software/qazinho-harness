export const FILE_VIEWER = {
  origin: 'https://download.qazinho',
  assets: '/~',
  maxBytes: 100 * 1024 * 1024,
  openLimitMs: 60_000,
  arrivalLimitMs: 30_000,
  arrivalPollMs: 250,
  pagesShown: 50,
  linesPerBlock: 50,
  textBytesShown: 2_000_000,
  textInView: 12_000,
  marginPx: 48,
  maxScale: 1.6,
} as const;
