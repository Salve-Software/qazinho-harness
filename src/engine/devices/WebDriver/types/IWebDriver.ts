import type { IWebAccess } from './IWebAccess';
import type { IViewport } from '@/contract';
import type { ShrinkImage } from '@/engine/devices/types';

/**
 * Chrome on a profile the driver owns; `shrink` scales what the agent sees; `access`
 * opens a protected app.
 */
export interface IWebDriver {
  url: string;
  profileDir: string;
  viewport?: IViewport;
  pixelRatio?: number;
  shrink?: ShrinkImage;
  access?: IWebAccess;
}
