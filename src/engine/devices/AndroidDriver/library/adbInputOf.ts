import type { DeviceInput } from '@/contract';
import { ANDROID } from '@/engine/devices/AndroidDriver/constants';
import { pointOf } from '@/engine/devices/library';
import { adbTextsOf } from './adbTextsOf';

/**
 * Um gesto do QA como as chamadas de `adb shell input` que o fazem numa tela desse
 * tamanho; uma rolagem arrasta o dedo para o lado contrário.
 */
export function adbInputOf(props: {
  input: DeviceInput;
  size: { width: number; height: number };
}): string[][] {
  const { input, size } = props;

  if (input.kind === 'type') {
    if (input.text.includes('"')) throw new Error(ANDROID.noDoubleQuote);

    return adbTextsOf(input.text).map((chunk) => ['input', 'text', chunk]);
  }

  if (input.kind === 'key') return [['input', 'keyevent', ANDROID.inputKeys[input.key]]];

  const at = pointOf({ x: input.x, y: input.y, size });

  if (input.kind === 'tap') return [['input', 'tap', String(at.x), String(at.y)]];

  const to =
    input.kind === 'scroll'
      ? pointOf({ x: input.x - input.dx, y: input.y - input.dy, size })
      : pointOf({ x: input.toX, y: input.toY, size });

  return [
    [
      'input',
      'swipe',
      ...[at.x, at.y, to.x, to.y].map(String),
      String(input.kind === 'scroll' ? ANDROID.swipeMs : ANDROID.dragMs),
    ],
  ];
}
