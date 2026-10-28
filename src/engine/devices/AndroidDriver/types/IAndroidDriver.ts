import type { ShrinkImage } from '@/engine/devices/types';

/** O SDK e o AVD que o QA já tem, o apk em teste, e como reduzir o que o agente vê. */
export interface IAndroidDriver {
  sdkRoot: string;
  avd: string;
  apk: string;
  shrink?: ShrinkImage;
}
