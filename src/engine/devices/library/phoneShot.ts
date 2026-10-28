import type { ShrinkImage } from '@/engine/devices/types';
import { pngSizeOf } from './pngSizeOf';

const QUALITY = 70;

/**
 * A captura de tela de um celular como uma run a guarda: um JPEG no tamanho cheio, como a
 * web guarda a do Chrome; o PNG como veio quando não dá.
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
