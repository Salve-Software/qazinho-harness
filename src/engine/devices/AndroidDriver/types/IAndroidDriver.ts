import type { ShrinkImage } from '@/engine/devices/types';

/** The SDK and AVD the QA already has, the apk under test, and how to shrink what the agent sees. */
export interface IAndroidDriver {
  sdkRoot: string;
  avd: string;
  apk: string;
  shrink?: ShrinkImage;
}
