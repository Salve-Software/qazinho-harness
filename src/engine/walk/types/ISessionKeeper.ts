import type { IRecipeBook, ISignInRecipe } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IDevicePort } from '@/tools/servers/device/types';

/**
 * O que guarda as sessões de uma run web precisa: o navegador, a porta que digita as
 * variáveis, as gravações e um turno do agente que entra numa conta.
 */
export interface ISessionKeeper {
  driver: IDeviceDriver;
  port: IDevicePort;
  book: IRecipeBook;
  appUrl: string;
  signIn: (account: string) => Promise<ISignInRecipe | null>;
  isStopped: () => boolean;
}
