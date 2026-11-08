import type { IScreenBox } from '@/contract';
import type { IBox } from '@/engine/devices/types';
import type { Locator } from 'playwright-core';
import { fractionBoxOf } from '@/engine/devices/library';

const CONTROLS = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG', 'SVG', 'VIDEO'];

const TIGHT_SHARE = 0.85;

/**
 * Onde um locator está em frações da tela, um iframe incluído: um texto pelas letras
 * dele, não pelo bloco em que está, e um controle pela caixa dele.
 */
export async function screenBoxOf(props: {
  locator: Locator;
  screen: { width: number; height: number };
}): Promise<IScreenBox | null> {
  const { locator, screen } = props;
  const [placed, shape] = await Promise.all([
    locator.boundingBox(),
    locator.evaluate(
      (node, controls) => {
        type Rect = { left: number; top: number; width: number; height: number };
        type Shown = {
          tagName: string;
          getAttribute: (name: string) => string | null;
          getBoundingClientRect: () => Rect;
          ownerDocument: {
            createRange: () => {
              selectNodeContents: (one: unknown) => void;
              getBoundingClientRect: () => Rect;
            };
          };
        };
        const element = node as unknown as Shown;
        const outer = element.getBoundingClientRect();
        const pick = ({ left, top, width, height }: Rect) => ({
          left,
          top,
          width,
          height,
        });

        if (controls.includes(element.tagName.toUpperCase()))
          return { outer: pick(outer), text: null };

        if (element.getAttribute('role') === 'button')
          return { outer: pick(outer), text: null };

        const range = element.ownerDocument.createRange();

        range.selectNodeContents(node);

        return { outer: pick(outer), text: pick(range.getBoundingClientRect()) };
      },
      [...CONTROLS],
    ),
  ]).catch(() => [null, null] as const);

  if (placed === null || shape === null) return null;

  return fractionBoxOf({ box: tightBoxOf({ placed, shape }), screen });
}

function tightBoxOf(props: {
  placed: IBox;
  shape: {
    outer: { left: number; top: number; width: number; height: number };
    text: { left: number; top: number; width: number; height: number } | null;
  };
}): IBox {
  const { placed } = props;
  const { outer, text } = props.shape;
  const isTight =
    text !== null &&
    text.width > 0 &&
    text.height > 0 &&
    text.width * text.height < outer.width * outer.height * TIGHT_SHARE;

  return isTight
    ? {
        x: placed.x + text.left - outer.left,
        y: placed.y + text.top - outer.top,
        width: text.width,
        height: text.height,
      }
    : placed;
}
