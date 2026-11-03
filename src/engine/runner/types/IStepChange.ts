import type { IStepRecipe } from '@/contract';

/** Como a gravação de um passo era, e como ficou depois que o agente o curou. */
export interface IStepChange {
  before: Pick<IStepRecipe, 'actions' | 'proof'>;
  after: Pick<IStepRecipe, 'actions' | 'proof'>;
}
