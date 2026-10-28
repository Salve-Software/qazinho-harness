import type { IActionMotion, IDeviceImage, IStepAction } from '@/contract';

/**
 * O que as ferramentas do dispositivo precisam: ler, ver e medir a tela, agir nela, e
 * listar as chamadas de API do app.
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
