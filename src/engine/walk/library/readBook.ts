import type { IRecipeBook } from '@/contract';

/**
 * The recipes a workspace kept, read back from their file; a file that is missing or
 * broken is an empty book, never a failed run.
 */
export function readBook(text: string | null): IRecipeBook {
  if (text === null) return { cases: [] };

  try {
    const read = JSON.parse(text) as Partial<IRecipeBook>;

    return Array.isArray(read.cases) ? { cases: read.cases } : { cases: [] };
  } catch {
    return { cases: [] };
  }
}
