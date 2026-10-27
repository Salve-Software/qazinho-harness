import { ANDROID } from '@/engine/devices/AndroidDriver/constants';

/**
 * The screen's density as `wm density` prints it, the override over the physical one; the
 * baseline 160 when it says neither.
 */
export function densityOf(printed: string): number {
  const read = (label: string) =>
    Number(
      new RegExp(`${label} density:\\s*(\\d+)`, 'i').exec(printed)?.[1] ?? Number.NaN,
    );
  const override = read('Override');
  const physical = read('Physical');

  return override > 0 ? override : physical > 0 ? physical : ANDROID.baselineDensity;
}
