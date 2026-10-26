import type { IFlatStep, TargetKind } from '@/contract';
import { createHash } from 'node:crypto';

/** What a case says, as a short hash: a recipe holds only while its case reads the same on the same kind of target. */
export function fingerprintOf(props: {
  targetKind: TargetKind;
  steps: IFlatStep[];
}): string {
  const [first] = props.steps;

  return createHash('sha1')
    .update(
      JSON.stringify({
        targetKind: props.targetKind,
        preconditions: first?.casePreconditions ?? '',
        steps: props.steps.map(({ action, expected }) => [action, expected]),
      }),
    )
    .digest('hex')
    .slice(0, 16);
}
