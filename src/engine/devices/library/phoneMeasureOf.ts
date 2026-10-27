import type { IBox, IElementMeasure } from '@/engine/devices/types';
import { gapsOf } from './gapsOf';

/**
 * One thing on a phone's screen measured from the screen's tree: its box in the unit a
 * design uses, the smallest box around it, and the space to its neighbours.
 */
export function phoneMeasureOf(props: {
  role: string;
  text: string;
  box: IBox;
  others: IBox[];
  unit: 'dp' | 'pt';
  scale: number;
}): IElementMeasure {
  const box = scaled({ box: props.box, scale: props.scale });
  const others = props.others.map((other) => scaled({ box: other, scale: props.scale }));
  const around = others
    .filter((other) => contains({ outer: other, inner: box }))
    .sort((one, two) => one.width * one.height - two.width * two.height);

  return {
    role: props.role,
    text: props.text,
    unit: props.unit,
    box,
    parent: around[0] ?? null,
    gaps: gapsOf({ box, others }),
    style: null,
  };
}

function scaled(props: { box: IBox; scale: number }): IBox {
  const { box, scale } = props;

  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}

function contains(props: { outer: IBox; inner: IBox }): boolean {
  const { outer, inner } = props;

  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.width >= inner.x + inner.width &&
    outer.y + outer.height >= inner.y + inner.height &&
    outer.width * outer.height > inner.width * inner.height
  );
}
