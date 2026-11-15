import type { IWebAccess } from './IWebAccess';
import type { IWindowPlace } from './IWindowPlace';
import type { IDeviceScreen, IViewport } from '@/contract';
import type { ShrinkImage } from '@/engine/devices/types';

/**
 * O Chrome num perfil que o driver controla, sem janela, ou numa janela em `window` que
 * o QA usa; `onClosed` ouve o QA fechá-la.
 */
export interface IWebDriver {
  url: string;
  profileDir: string;
  viewport?: IViewport;
  pixelRatio?: number;
  shrink?: ShrinkImage;
  access?: IWebAccess;
  onAddress?: (url: string) => void;
  onScreens?: (screens: IDeviceScreen[]) => void;
  window?: IWindowPlace;
  onClosed?: () => void;
}
