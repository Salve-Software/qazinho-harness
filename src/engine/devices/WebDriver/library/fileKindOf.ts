import type { FileKind } from '@/engine/devices/WebDriver/types';

const IMAGE_HEADS = [
  Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  Buffer.from([0xff, 0xd8, 0xff]),
  Buffer.from('GIF8'),
  Buffer.from('BM'),
];
const HEAD_BYTES = 8_192;
const PDF_MARK_WITHIN = 1_024;

/** Como mostrar um arquivo baixado, pelo começo dele; null para o que não dá. */
export function fileKindOf(props: { name: string; bytes: Buffer }): FileKind | null {
  const { name, bytes } = props;

  if (bytes.subarray(0, PDF_MARK_WITHIN).includes('%PDF-')) return 'pdf';

  if (isImage(bytes) || /\.svg$/i.test(name)) return 'image';

  if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'text';

  return bytes.subarray(0, HEAD_BYTES).includes(0) ? null : 'text';
}

function isImage(bytes: Buffer): boolean {
  return (
    IMAGE_HEADS.some((head) => bytes.subarray(0, head.length).equals(head)) ||
    (bytes.subarray(0, 4).toString('latin1') === 'RIFF' &&
      bytes.subarray(8, 12).toString('latin1') === 'WEBP')
  );
}
