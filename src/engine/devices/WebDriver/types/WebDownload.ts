/** Um arquivo que o navegador baixou: ainda chegando, guardado, ou que não terminou. */
export type WebDownload =
  | { state: 'saving'; name: string }
  | { state: 'saved'; name: string; path: string; size: number }
  | { state: 'failed'; name: string; failure: string };
