import type { IBox, IElementMeasure } from '@/engine/devices/types';
import { hexOfColor } from './hexOfColor';

const UNIT_NAMES = { px: 'CSS px', dp: 'dp', pt: 'points' } as const;

/**
 * What `inspect` answers: the thing measured, in the screen's unit, with the box it sits
 * in, the space around it, and in a browser its type, colours and spacing.
 */
export function describeMeasure(measure: IElementMeasure): string {
  const { style, gaps } = measure;
  const named =
    measure.text.length === 0 ? measure.role : `"${measure.text}" (${measure.role})`;

  return [
    `${named}, measured in ${UNIT_NAMES[measure.unit]}:`,
    `box: ${boxLine(measure.box)}`,
    ...(measure.parent === null ? [] : [`inside: ${boxLine(measure.parent)}`]),
    `space around: ${[
      gapLine(gaps.above, 'above'),
      gapLine(gaps.below, 'below'),
      gapLine(gaps.left, 'left'),
      gapLine(gaps.right, 'right'),
    ].join(', ')}`,
    ...(style === null
      ? [
          'This device does not say its type, colours or inner spacing. Hold its box and the space around it to the design, and judge the rest on the picture.',
        ]
      : [
          `type: ${style.font}, ${style.fontSize} / line ${style.lineHeight}, weight ${style.fontWeight}, letter-spacing ${style.letterSpacing}`,
          `colour: ${hexOfColor(style.color)} on ${hexOfColor(style.background)}`,
          `padding ${style.padding} · margin ${style.margin} · border ${style.border.replace(/rgba?\([^)]*\)/gi, (color) => hexOfColor(color))} · corners ${style.radius} · gap ${style.gap} · opacity ${style.opacity}`,
        ]),
  ].join('\n');
}

function boxLine(box: IBox): string {
  return `x ${String(Math.round(box.x))}, y ${String(Math.round(box.y))}, ${String(Math.round(box.width))} × ${String(Math.round(box.height))}`;
}

function gapLine(gap: number | null, side: string): string {
  return gap === null ? `nothing ${side}` : `${String(gap)} ${side}`;
}
