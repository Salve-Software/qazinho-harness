import type { ICaseRecipe, IRecipeBook } from '@/contract';
import type { IStepChange } from '@/engine/runner/types';

/**
 * O que mudou na gravação de cada caso gravado de novo, por caso e passo: null num passo
 * igual ao de antes; um caso sem gravação antiga fica de fora.
 */
export function stepChangesOf(props: {
  book: IRecipeBook;
  recorded: ICaseRecipe[];
}): Map<string, Map<number, IStepChange | null>> {
  return new Map(
    props.recorded.flatMap((after) => {
      const before = props.book.cases.find(
        (one) => one.caseId === after.caseId && one.fingerprint === after.fingerprint,
      );

      return before === undefined ? [] : [[after.caseId, changesOf({ before, after })]];
    }),
  );
}

function changesOf(props: {
  before: ICaseRecipe;
  after: ICaseRecipe;
}): Map<number, IStepChange | null> {
  return new Map(
    props.after.steps.map((step) => {
      const old = props.before.steps.find((one) => one.number === step.number);
      const before = { actions: old?.actions ?? [], proof: old?.proof ?? '' };
      const after = { actions: step.actions, proof: step.proof };

      return [
        step.number,
        JSON.stringify(before) === JSON.stringify(after) ? null : { before, after },
      ];
    }),
  );
}
