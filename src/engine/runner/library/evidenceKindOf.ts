import { extname } from 'node:path';

const KINDS: Record<
  string,
  { kind: 'screenshot' | 'video' | 'network'; contentType: string }
> = {
  '.jpg': { kind: 'screenshot', contentType: 'image/jpeg' },
  '.jpeg': { kind: 'screenshot', contentType: 'image/jpeg' },
  '.png': { kind: 'screenshot', contentType: 'image/png' },
  '.mp4': { kind: 'video', contentType: 'video/mp4' },
  '.webm': { kind: 'video', contentType: 'video/webm' },
  '.json': { kind: 'network', contentType: 'application/json' },
};

/**
 * Se um arquivo de uma run é uma tela, o vídeo ou as requisições dela, e o content type;
 * null para um que um runner nunca manda.
 */
export function evidenceKindOf(
  file: string,
): { kind: 'screenshot' | 'video' | 'network'; contentType: string } | null {
  return KINDS[extname(file).toLowerCase()] ?? null;
}
