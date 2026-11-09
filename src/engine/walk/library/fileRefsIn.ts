import type { ICaseRecipe } from '@/contract';
import { readFileRef } from './readFileRef';

/** Os arquivos que estas gravações sobem, sem repetir. */
export function fileRefsIn(recipes: Pick<ICaseRecipe, 'steps'>[]): string[] {
  return [
    ...new Set(
      recipes.flatMap(({ steps }) =>
        steps.flatMap(({ actions }) =>
          actions.flatMap(({ files }) =>
            (files ?? []).filter((file) => readFileRef(file) !== null),
          ),
        ),
      ),
    ),
  ];
}
