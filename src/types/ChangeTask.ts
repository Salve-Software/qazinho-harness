import type { IBrokenTest } from './IBrokenTest';
import type { IWantedTest } from './IWantedTest';

/**
 * O que o agente que muda a suíte de um time vai fazer: consertar um teste que quebrou,
 * ou escrever um novo.
 */
export type ChangeTask =
  { kind: 'fix'; broken: IBrokenTest } | { kind: 'write'; wanted: IWantedTest };
