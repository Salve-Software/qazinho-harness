import type { IActionMotion, IDeviceImage, IStepAction } from '@/contract';

/**
 * What the device tools need: read, see and measure the screen, act on it, and list the
 * app's API calls.
 */
export interface IDevicePort {
  describe: () => Promise<string>;
  inspect: (target: string) => Promise<string>;
  failedCalls: () => Promise<string[]>;
  calls: (ask: { id?: number; filter?: string }) => Promise<string>;
  glance: () => Promise<IDeviceImage | null>;
  act: (action: IStepAction) => Promise<void>;
  motion: () => Promise<IActionMotion | null>;
}
