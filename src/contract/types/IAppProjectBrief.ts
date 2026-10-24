import type { IVariableBrief } from './IVariableBrief';
import type { TargetKind } from './TargetKind';

/** A project as the assistant reads it: its targets, the repositories it is made of with their base branch, and its variables by name, never a value. */
export interface IAppProjectBrief {
  id: string;
  name: string;
  targets: { kind: TargetKind; value: string }[];
  repositories: { name: string; base: string }[];
  variables: IVariableBrief[];
}
