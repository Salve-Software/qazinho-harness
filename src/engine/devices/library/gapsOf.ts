import type { IBox, IGaps } from '@/engine/devices/types';

/**
 * O espaço entre uma caixa e a caixa mais próxima de cada lado dela, contando só as
 * caixas que ficam ao lado, não em volta nem dentro.
 */
export function gapsOf(props: { box: IBox; others: IBox[] }): IGaps {
  const { box } = props;
  const across = props.others.filter((other) =>
    overlaps({
      from: box.x,
      size: box.width,
      otherFrom: other.x,
      otherSize: other.width,
    }),
  );
  const along = props.others.filter((other) =>
    overlaps({
      from: box.y,
      size: box.height,
      otherFrom: other.y,
      otherSize: other.height,
    }),
  );

  return {
    above: nearest(
      across
        .filter((other) => other.y + other.height <= box.y)
        .map((other) => box.y - (other.y + other.height)),
    ),
    below: nearest(
      across
        .filter((other) => other.y >= box.y + box.height)
        .map((other) => other.y - (box.y + box.height)),
    ),
    left: nearest(
      along
        .filter((other) => other.x + other.width <= box.x)
        .map((other) => box.x - (other.x + other.width)),
    ),
    right: nearest(
      along
        .filter((other) => other.x >= box.x + box.width)
        .map((other) => other.x - (box.x + box.width)),
    ),
  };
}

function overlaps(props: {
  from: number;
  size: number;
  otherFrom: number;
  otherSize: number;
}): boolean {
  return (
    props.otherFrom < props.from + props.size &&
    props.otherFrom + props.otherSize > props.from
  );
}

function nearest(gaps: number[]): number | null {
  return gaps.length === 0 ? null : Math.round(Math.min(...gaps));
}
