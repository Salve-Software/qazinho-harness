import type { IActionMotion } from '@/contract';
import { MOTION_LIMITS } from '@/tools/servers/device/constants/MOTION_LIMITS';

/**
 * Como a página se mexeu durante uma ação, numa frase que o agente consegue pesar; null
 * quando não há leitura.
 */
export function describeMotion(motion: IActionMotion | null): string | null {
  if (motion === null) return null;

  const moved: string[] = [];

  if (motion.shift >= MOTION_LIMITS.shift)
    moved.push(
      motion.unexpectedShift >= MOTION_LIMITS.shift
        ? `the layout shifted ${round(motion.shift)} in ${count({ n: motion.shifts, one: 'move', many: 'moves' })}, ${round(motion.unexpectedShift)} of it with no input to explain it`
        : `the layout shifted ${round(motion.shift)} in ${count({ n: motion.shifts, one: 'move', many: 'moves' })}, all right after the input`,
    );

  if (motion.slowestFrameMs >= MOTION_LIMITS.slowFrameMs)
    moved.push(
      `${count({ n: motion.longFrames, one: 'frame', many: 'frames' })} ran long, the slowest ${String(motion.slowestFrameMs)} ms`,
    );

  return moved.length === 0
    ? 'The page held still while it acted.'
    : `While it acted, ${moved.join(', and ')}.`;
}

const round = (value: number) => value.toFixed(2);

const count = (props: { n: number; one: string; many: string }) =>
  `${String(props.n)} ${props.n === 1 ? props.one : props.many}`;
