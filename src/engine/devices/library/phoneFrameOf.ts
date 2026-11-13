import type { IDeviceFrame, ShrinkImage } from '@/engine/devices/types';
import { phoneShot } from './phoneShot';
import { pngSizeOf } from './pngSizeOf';

/**
 * O screencap de um celular como um quadro do stream que o QA vê: um JPEG e o formato da
 * tela; null quando ele não vira JPEG.
 */
export function phoneFrameOf(props: {
  image: Buffer;
  shrink: ShrinkImage | null;
}): IDeviceFrame | null {
  const size = pngSizeOf(props.image);
  const shot = phoneShot(props);

  return size === null || shot.mimeType !== 'image/jpeg'
    ? null
    : { jpeg: shot.bytes, ratio: size.width / size.height };
}
