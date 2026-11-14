import type { DeviceInput } from '@/contract';
import { IOS } from '@/engine/devices/IosDriver/constants';
import { pointOf } from '@/engine/devices/library';

/**
 * Um gesto do QA como as chamadas de `idb ui` que o fazem, nos pontos de uma tela desse
 * tamanho; uma tecla que o iOS não tem não faz nada.
 */
export function idbInputOf(props: {
  input: DeviceInput;
  size: { width: number; height: number };
}): string[][] {
  const { input, size } = props;

  if (input.kind === 'type') return [['text', input.text]];

  if (input.kind === 'key') {
    const code = IOS.inputKeys[input.key];

    return code === undefined ? [] : [['key', code]];
  }

  const at = pointOf({ x: input.x, y: input.y, size });

  if (input.kind === 'tap') return [['tap', String(at.x), String(at.y)]];

  const to =
    input.kind === 'scroll'
      ? pointOf({ x: input.x - input.dx, y: input.y - input.dy, size })
      : pointOf({ x: input.toX, y: input.toY, size });

  return [
    [
      'swipe',
      ...[at.x, at.y, to.x, to.y].map(String),
      '--duration',
      String(input.kind === 'scroll' ? IOS.swipeSec : IOS.dragSec),
    ],
  ];
}
