import type { IDeviceFrame } from './IDeviceFrame';
import type { IShot } from './IShot';
import type { IWebSession } from './IWebSession';
import type {
  DeviceInput,
  IDeviceImage,
  INetworkEntry,
  IRunVideo,
  IScreenBox,
  IStepAction,
  IViewport,
} from '@/contract';

/**
 * O que uma run precisa de um dispositivo, navegador ou celular; um navegador também diz
 * os locators, as requisições e a sessão, e um celular manda a tela ao QA que o dirige.
 */
export interface IDeviceDriver {
  open: () => Promise<void>;
  restart: (session?: IWebSession) => Promise<void>;
  act: (action: IStepAction) => Promise<void>;
  describe: () => Promise<string>;
  inspect: (target: string) => Promise<string>;
  locate?: (target: string) => Promise<IScreenBox | null>;
  reveal?: (target: string) => Promise<boolean>;
  glance: () => Promise<IDeviceImage | null>;
  resize: (viewport: IViewport) => Promise<void>;
  focus: (isFocused: boolean) => Promise<void>;
  shoot: (file: string) => Promise<IShot | null>;
  stream: (onFrame: (jpeg: Buffer, screen?: number) => void) => Promise<boolean>;
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
  touch?: (input: DeviceInput) => Promise<void>;
  snapshot?: () => Promise<IDeviceFrame | null>;
  sessionState?: () => Promise<IWebSession | null>;
}
