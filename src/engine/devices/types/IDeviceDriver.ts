import type { IShot } from './IShot';
import type {
  IActionMotion,
  IDeviceImage,
  INetworkEntry,
  IRunVideo,
  IStepAction,
  IViewport,
} from '@/contract';

/** What a run needs from a device, whether it is a browser or a phone, measuring what it shows included; a browser also says how it found its last target, the requests the app made, and what its API calls answered. */
export interface IDeviceDriver {
  open: () => Promise<void>;
  restart: () => Promise<void>;
  act: (action: IStepAction) => Promise<void>;
  describe: () => Promise<string>;
  inspect: (target: string) => Promise<string>;
  glance: () => Promise<IDeviceImage | null>;
  motion: () => Promise<IActionMotion | null>;
  resize: (viewport: IViewport) => Promise<void>;
  focus: (isFocused: boolean) => Promise<void>;
  shoot: (file: string) => Promise<IShot | null>;
  stream: (onFrame: (jpeg: Buffer) => void) => Promise<boolean>;
  record: (folder: string) => Promise<boolean>;
  stopRecording: () => Promise<IRunVideo | null>;
  close: () => Promise<void>;
  resolution?: () => {
    locator: string;
    toLocator: string | null;
    option: string | null;
  } | null;
  network?: () => INetworkEntry[];
  apiCalls?: (since: number) => INetworkEntry[];
  responseBody?: (id: number) => Promise<string | null>;
}
