import type { IFlatStep, TargetKind } from '@/contract';

/**
 * A conta em que um caso começa logado, numa run web; null num celular, que entra de novo
 * em todo caso, ou num caso que começa sem login.
 */
export function signedInAsOf(props: {
  steps: IFlatStep[];
  targetKind: TargetKind;
}): string | null {
  if (props.targetKind !== 'web') return null;

  const account = props.steps[0]?.caseSignedInAs?.trim() ?? '';

  return account.length > 0 ? account : null;
}
