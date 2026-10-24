import type { TargetKind } from './TargetKind';

/** What the run opens: a URL for web, a build on disk for Android and iOS. */
export interface ITargetUnderTest {
  kind: TargetKind;
  value: string;
}
