import type { ShrinkImage } from '@/engine/devices/types';
import { pngSizeOf } from './pngSizeOf';

const QUALITY = 70;

/**
 * A phone's screenshot as a run keeps it: a JPEG at its full size, as the web keeps
 * Chrome's; the PNG as it came when it cannot be one.
 */
export function phoneShot(props: { image: Buffer; shrink: ShrinkImage | null }): {
  bytes: Buffer;
  mimeType: 'image/jpeg' | 'image/png';
} {
  const size = pngSizeOf(props.image);

  if (props.shrink === null || size === null)
    return { bytes: props.image, mimeType: 'image/png' };

  return {
    bytes: props.shrink({ image: props.image, ...size, quality: QUALITY }),
    mimeType: 'image/jpeg',
  };
}
