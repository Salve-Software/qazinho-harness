import { ANDROID } from '@/engine/devices/AndroidDriver/constants';

/**
 * A densidade da tela como o `wm density` a imprime, a sobrescrita acima da física; a
 * base 160 quando ele não diz nenhuma.
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
