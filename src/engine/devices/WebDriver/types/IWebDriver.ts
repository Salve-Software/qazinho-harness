import type { IWebAccess } from './IWebAccess';
import type { IViewport } from '@/contract';
import type { ShrinkImage } from '@/engine/devices/types';

/**
 * O Chrome num perfil que o driver controla; `shrink` reduz o que o agente vê; `access`
 * abre um app protegido; `onAddress` ouve o endereço da aba que o QA vê.
 */
export interface IWebDriver {
  url: string;
  profileDir: string;
  viewport?: IViewport;
  pixelRatio?: number;
  shrink?: ShrinkImage;
  access?: IWebAccess;
  onAddress?: (url: string) => void;
}
