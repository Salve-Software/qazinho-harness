import type { WebDownload } from './WebDownload';

/** O arquivo que o agente pediu: guardado, ainda por chegar, ou recusado com o motivo. */
export type DownloadPick =
  | { kind: 'saved'; file: Extract<WebDownload, { state: 'saved' }> }
  | { kind: 'waiting'; why: string }
  | { kind: 'refused'; why: string };
