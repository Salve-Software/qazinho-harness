import type { DownloadPick, WebDownload } from '@/engine/devices/WebDriver/types';

/**
 * O arquivo baixado que um pedido nomeia: o último sem nome, ou o único quando o nome já
 * não bate, como um que leva a data, e por que não há o que abrir.
 */
export function downloadNamed(props: {
  downloads: WebDownload[];
  name: string;
}): DownloadPick {
  const { downloads } = props;
  const name = props.name.trim().toLowerCase();

  if (downloads.length === 0)
    return {
      kind: 'waiting',
      why: 'The browser saved no file yet: click what downloads it first.',
    };

  const named =
    name === ''
      ? downloads.at(-1)
      : (downloads.findLast((one) => one.name.toLowerCase() === name) ??
        (downloads.length === 1 ? downloads[0] : undefined));

  if (named === undefined)
    return {
      kind: 'refused',
      why: `No file is called "${props.name}". The browser saved: ${downloads.map((one) => one.name).join(', ')}.`,
    };

  if (named.state === 'saving')
    return { kind: 'waiting', why: `${named.name} is still downloading.` };

  if (named.state === 'failed')
    return {
      kind: 'refused',
      why: `${named.name} did not finish downloading: ${named.failure}.`,
    };

  return { kind: 'saved', file: named };
}
