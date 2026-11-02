import type { IVariableValue } from '@/engine/types';
import { hiddenValues } from './hiddenValues';
import { proofHolds } from './proofHolds';
import { proofLinesOf } from './proofLinesOf';

/**
 * A prova como uma run sem agente a confere: uma variável pelo nome dela, e só as linhas
 * que o texto da tela mostra, já que o agente também copia da foto.
 */
export function provableProof(props: {
  proof: string;
  screen: string;
  values: IVariableValue[];
}): string {
  const { proof, screen, values } = props;

  return proofLinesOf(hiddenValues({ text: proof, values }))
    .filter((line) => proofHolds({ screen, proof: line }))
    .join('\n');
}
