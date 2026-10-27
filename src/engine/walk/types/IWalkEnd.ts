import type { ICaseRecipe } from '@/contract';

/**
 * What a walk leaves once it ends: the recordings its agent made or healed, and why it
 * broke off, if it did.
 */
export interface IWalkEnd {
  recorded: ICaseRecipe[];
  failure: string | null;
}
