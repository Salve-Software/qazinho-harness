import type { IRecipeBook } from '@/contract';

/**
 * As receitas que um workspace guardou, lidas de volta do arquivo; um arquivo ausente ou
 * quebrado é um livro vazio, nunca uma run que falhou.
 */
export function readBook(text: string | null): IRecipeBook {
  if (text === null) return { cases: [] };

  try {
    const read = JSON.parse(text) as Partial<IRecipeBook>;

    return Array.isArray(read.cases)
      ? {
          cases: read.cases,
          ...(Array.isArray(read.partial) ? { partial: read.partial } : {}),
          ...(Array.isArray(read.preps) ? { preps: read.preps } : {}),
        }
      : { cases: [] };
  } catch {
    return { cases: [] };
  }
}
