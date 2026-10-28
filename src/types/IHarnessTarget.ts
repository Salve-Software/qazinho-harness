import type { HarnessRole } from './HarnessRole';
import type { TargetKind } from '@/contract';

/**
 * Contra o que o harness resolve cada canal: o papel, e a plataforma do dispositivo
 * quando há uma.
 */
export interface IHarnessTarget {
  role: HarnessRole;
  platform?: TargetKind;
}
