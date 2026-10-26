/** uiautomator writes a box as `[left,top][right,bottom]`; a finger lands in the middle of it. */
export function centreOf(bounds: string): { x: number; y: number } | null {
  const box = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(bounds);

  if (!box) return null;

  const [left, top, right, bottom] = box.slice(1).map(Number) as [
    number,
    number,
    number,
    number,
  ];

  if (right <= left || bottom <= top) return null;

  return { x: Math.round((left + right) / 2), y: Math.round((top + bottom) / 2) };
}
