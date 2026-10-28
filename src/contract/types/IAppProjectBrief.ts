import type { IVariableBrief } from './IVariableBrief';
import type { TargetKind } from './TargetKind';

/**
 * Um projeto como o assistente o lê: os alvos, os repositórios de que é feito com a
 * branch base de cada um, e as variáveis pelo nome, nunca um valor.
 */
export interface IAppProjectBrief {
  id: string;
  name: string;
  targets: { kind: TargetKind; value: string }[];
  repositories: { name: string; base: string }[];
  variables: IVariableBrief[];
}
