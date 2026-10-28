import type { ICaseRecipe } from '@/contract';

/**
 * O que um walk deixa quando termina: as gravações que o agente fez ou consertou, e por
 * que ele parou no meio, se parou.
 */
export interface IWalkEnd {
  recorded: ICaseRecipe[];
  failure: string | null;
}
