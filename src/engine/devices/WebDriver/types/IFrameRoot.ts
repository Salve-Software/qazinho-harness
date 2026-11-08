import type { Frame, FrameLocator, Page } from 'playwright-core';

/**
 * Um documento que a página mostra, ela ou um iframe dentro dela: onde lê-lo, por onde um
 * locator chega a ele, e o nome com que o agente o vê.
 */
export interface IFrameRoot {
  scope: Page | Frame;
  root: Page | FrameLocator;
  name: string | null;
}
