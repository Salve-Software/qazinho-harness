import type { WebDownload } from '@/engine/devices/WebDriver/types';

const KILOBYTE = 1_024;
const MEGABYTE = KILOBYTE * KILOBYTE;

/** Os arquivos que o navegador baixou no caso, como o agente os lê; sem nenhum, nada. */
export function describeDownloads(downloads: WebDownload[]): string | null {
  if (downloads.length === 0) return null;

  return [
    'DOWNLOADS (files the browser saved):',
    ...downloads.map(
      (download) =>
        `${download.name}, ${
          download.state === 'saved'
            ? sizeOf(download.size)
            : download.state === 'saving'
              ? 'still downloading'
              : `failed: ${download.failure}`
        }`,
    ),
  ].join('\n');
}

function sizeOf(bytes: number): string {
  return bytes < MEGABYTE
    ? `${String(Math.max(1, Math.round(bytes / KILOBYTE)))} KB`
    : `${(bytes / MEGABYTE).toFixed(1)} MB`;
}
