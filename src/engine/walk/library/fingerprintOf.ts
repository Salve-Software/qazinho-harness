import type { IFlatStep, TargetKind } from '@/contract';
import { createHash } from 'node:crypto';

/**
 * O que um caso diz, como um hash curto: uma receita só vale enquanto o caso disser o
 * mesmo, na mesma conta, no mesmo tipo de alvo.
 */
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
        ...(first?.caseSignedInAs === undefined
          ? {}
          : { signedInAs: first.caseSignedInAs }),
      }),
    )
    .digest('hex')
    .slice(0, 16);
}
