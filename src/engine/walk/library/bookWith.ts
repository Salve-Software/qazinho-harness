import type { ICaseRecipe, IRecipeBook } from '@/contract';

/**
 * O livro com as receitas novas, cada uma no lugar da que o caso dela tinha; um caso
 * gravado inteiro não guarda a gravação parcial, e uma parcial nunca cobre uma inteira.
 */
export function bookWith(props: {
  book: IRecipeBook;
  recipes: ICaseRecipe[];
  partial?: ICaseRecipe[];
}): IRecipeBook {
  const fresh = new Set(props.recipes.map(({ caseId }) => caseId));
  const cases = [
    ...props.book.cases.filter(({ caseId }) => !fresh.has(caseId)),
    ...props.recipes,
  ];
  const started = (props.partial ?? []).filter(
    ({ caseId, fingerprint }) =>
      !cases.some((one) => one.caseId === caseId && one.fingerprint === fingerprint),
  );
  const moved = new Set([...fresh, ...started.map(({ caseId }) => caseId)]);
  const partial = [
    ...(props.book.partial ?? []).filter(({ caseId }) => !moved.has(caseId)),
    ...started,
  ];

  return partial.length > 0 ? { cases, partial } : { cases };
}
