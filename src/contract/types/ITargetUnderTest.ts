import type { TargetKind } from './TargetKind';

/** O que a run abre: uma URL na web, um build em disco no Android e no iOS. */
export interface ITargetUnderTest {
  kind: TargetKind;
  value: string;
}
