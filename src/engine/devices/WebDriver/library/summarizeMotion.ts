import type { IActionMotion } from '@/contract';

/** What the page's probe recorded since an action began, summed into how much the page moved. */
export function summarizeMotion(props: {
  shifts: { value: number; hadInput: boolean }[];
  frames: { ms: number }[];
}): IActionMotion {
  const sum = (values: number[]) =>
    Math.round(values.reduce((total, value) => total + value, 0) * 1000) / 1000;

  return {
    shift: sum(props.shifts.map(({ value }) => value)),
    unexpectedShift: sum(
      props.shifts.filter(({ hadInput }) => !hadInput).map(({ value }) => value),
    ),
    shifts: props.shifts.length,
    longFrames: props.frames.length,
    slowestFrameMs: Math.round(Math.max(0, ...props.frames.map(({ ms }) => ms))),
  };
}
