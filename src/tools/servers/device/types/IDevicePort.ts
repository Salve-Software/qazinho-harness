import type { IActionMotion, IDeviceImage, IStepAction } from '@/contract';

/** What the device tools need from a device: read, see and measure the screen, act on it, say how it moved and which API calls failed, and list the calls the app made or what one answered. */
export interface IDevicePort {
  describe: () => Promise<string>;
  inspect: (target: string) => Promise<string>;
  failedCalls: () => Promise<string[]>;
  calls: (ask: { id?: number; filter?: string }) => Promise<string>;
  glance: () => Promise<IDeviceImage | null>;
  act: (action: IStepAction) => Promise<void>;
  motion: () => Promise<IActionMotion | null>;
}
