import type { HarnessRole } from './HarnessRole';
import type { TargetKind } from '@/contract';

/**
 * What the harness resolves every channel against: the role, and the device platform when
 * there is one.
 */
export interface IHarnessTarget {
  role: HarnessRole;
  platform?: TargetKind;
}
