import type { IDeviceImage } from '@/contract';
import type { ShrinkImage } from '@/engine/devices/types';
import { fitPixels } from './fitPixels';
import { pngSizeOf } from './pngSizeOf';

const BUDGET = { maxPixels: 800_000, quality: 70 } as const;

/** A phone's screenshot as the agent reads it: shrunk to a budget of pixels when it can be, as it came when not. */
export function phoneGlance(props: {
  image: Buffer;
  shrink: ShrinkImage | null;
}): IDeviceImage {
  const { image, shrink } = props;
  const size = pngSizeOf(image);

  if (shrink === null || size === null)
    return { data: image.toString('base64'), mimeType: 'image/png' };

  const fitted = fitPixels({ ...size, maxPixels: BUDGET.maxPixels });

  return {
    data: shrink({ image, ...fitted, quality: BUDGET.quality }).toString('base64'),
    mimeType: 'image/jpeg',
  };
}
