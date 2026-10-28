import type { IBox, IElementMeasure, IElementStyle } from '@/engine/devices/types';
import type { Locator } from 'playwright-core';
import { gapsOf } from '@/engine/devices/library';

type Read = {
  role: string;
  text: string;
  box: IBox;
  parent: IBox | null;
  neighbours: IBox[];
  style: IElementStyle;
};

/**
 * Mede o que um locator achou onde a página está, rolada ou não: a caixa, a caixa em que
 * está, a distância aos vizinhos e o estilo calculado.
 */
export async function measureLocator(locator: Locator): Promise<IElementMeasure> {
  const read = await locator.evaluate((node): Read => {
    type Rect = { left: number; top: number; width: number; height: number };
    type Shown = {
      getBoundingClientRect: () => Rect;
      getAttribute: (name: string) => string | null;
      tagName: string;
      innerText?: string;
      parentElement: Shown | null;
      children: ArrayLike<Shown>;
    };
    type Style = Record<string, string>;
    const element = node as unknown as Shown;
    const view = globalThis as unknown as {
      scrollX: number;
      scrollY: number;
      getComputedStyle: (one: Shown) => Style;
    };
    const boxOf = (one: Shown): IBox => {
      const rect = one.getBoundingClientRect();

      return {
        x: rect.left + view.scrollX,
        y: rect.top + view.scrollY,
        width: rect.width,
        height: rect.height,
      };
    };
    const isShown = (one: Shown) => {
      const rect = one.getBoundingClientRect();

      return rect.width > 0 && rect.height > 0;
    };
    const parent = element.parentElement;
    const others = (from: Shown | null, skip: Shown | null) =>
      from === null
        ? []
        : Array.from(from.children).filter((one) => one !== skip && isShown(one));
    const siblings = others(parent, element);
    const neighbours =
      siblings.length > 0 ? siblings : others(parent?.parentElement ?? null, parent);
    const style = view.getComputedStyle(element);
    const value = (name: string) => style[name] ?? '';

    return {
      role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
      text: (element.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
      box: boxOf(element),
      parent: parent === null ? null : boxOf(parent),
      neighbours: neighbours.map(boxOf),
      style: {
        font: value('fontFamily'),
        fontSize: value('fontSize'),
        fontWeight: value('fontWeight'),
        lineHeight: value('lineHeight'),
        letterSpacing: value('letterSpacing'),
        color: value('color'),
        background: value('backgroundColor'),
        padding: value('padding'),
        margin: value('margin'),
        border: value('border'),
        radius: value('borderRadius'),
        gap: value('gap'),
        opacity: value('opacity'),
      },
    };
  });

  return {
    role: read.role,
    text: read.text,
    unit: 'px',
    box: read.box,
    parent: read.parent,
    gaps: gapsOf({ box: read.box, others: read.neighbours }),
    style: read.style,
  };
}
