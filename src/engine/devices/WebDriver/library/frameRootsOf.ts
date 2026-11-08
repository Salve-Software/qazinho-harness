import type { IFrameRoot } from '@/engine/devices/WebDriver/types';
import type { Frame, FrameLocator, Page } from 'playwright-core';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';

type Place = { isShown: boolean; selector: string; name: string | null };

/**
 * A página e cada iframe visível dentro dela, aninhados também, cada um com o caminho que
 * um locator percorre até ele, como `locator('iframe[title="Chat"]').contentFrame()`.
 */
export async function frameRootsOf(page: Page): Promise<IFrameRoot[]> {
  const roots: IFrameRoot[] = [{ scope: page, root: page, name: null }];

  if (typeof page.mainFrame !== 'function') return roots;

  await collect({ frame: page.mainFrame(), root: page, roots, depth: 0 });

  return roots;
}

async function collect(props: {
  frame: Frame;
  root: Page | FrameLocator;
  roots: IFrameRoot[];
  depth: number;
}): Promise<void> {
  if (props.depth >= WEB_DRIVER.frameDepth) return;

  for (const child of props.frame.childFrames()) {
    if (props.roots.length > WEB_DRIVER.frameLimit) return;

    const place = await placeOf(child);

    if (place === null || !place.isShown) continue;

    const root = props.root.locator(place.selector).contentFrame();

    props.roots.push({ scope: child, root, name: place.name ?? hostOf(child.url()) });
    await collect({ frame: child, root, roots: props.roots, depth: props.depth + 1 });
  }
}

async function placeOf(frame: Frame): Promise<Place | null> {
  const element = await frame.frameElement().catch(() => null);

  if (element === null) return null;

  return element
    .evaluate((node): Place => {
      type Node = {
        tagName: string;
        getAttribute: (name: string) => string | null;
        getBoundingClientRect: () => { width: number; height: number };
        ownerDocument: { querySelectorAll: (selector: string) => ArrayLike<Node> };
      };
      const own = node as unknown as Node;
      const tag = own.tagName.toLowerCase();
      const all = Array.from(own.ownerDocument.querySelectorAll(tag));
      const box = own.getBoundingClientRect();
      const quoted = (value: string) => value.replace(/["\\]/g, '\\$&');
      const unique = (name: string) => {
        const value = own.getAttribute(name);

        return value !== null &&
          value.trim().length > 0 &&
          all.filter((one) => one.getAttribute(name) === value).length === 1
          ? `${tag}[${name}="${quoted(value)}"]`
          : null;
      };

      return {
        isShown: box.width > 0 && box.height > 0,
        selector:
          unique('title') ??
          unique('name') ??
          `${tag} >> nth=${String(all.indexOf(own))}`,
        name: own.getAttribute('title') ?? own.getAttribute('name'),
      };
    })
    .catch(() => null);
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}
