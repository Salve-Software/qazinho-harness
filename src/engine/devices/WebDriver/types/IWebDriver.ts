import type { IWebAccess } from './IWebAccess';
import type { IViewport } from '@/contract';
import type { ShrinkImage } from '@/engine/devices/types';

/**
 * O Chrome num perfil que o driver controla; `shrink` reduz o que o agente vê; `access`
 * abre um app protegido.
 */
export interface IWebDriver {
  url: string;
  profileDir: string;
  viewport?: IViewport;
  pixelRatio?: number;
  shrink?: ShrinkImage;
  access?: IWebAccess;
}
