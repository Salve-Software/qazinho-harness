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

/** Whether a file of a run is a screen, its video or its requests, and its content type; null for one a runner never sends. */
export function evidenceKindOf(
  file: string,
): { kind: 'screenshot' | 'video' | 'network'; contentType: string } | null {
  return KINDS[extname(file).toLowerCase()] ?? null;
}
