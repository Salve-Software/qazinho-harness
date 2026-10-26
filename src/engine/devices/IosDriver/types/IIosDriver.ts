import type { ShrinkImage } from '@/engine/devices/types';

/** idb and the simulator the QA already has, the app under test, and how to shrink what the agent sees. */
export interface IIosDriver {
  idb: string;
  udid: string;
  app: string;
  shrink?: ShrinkImage;
}
