import type { IFlatStep } from '@/contract';

const NAMED = /\$\{([A-Z][A-Z0-9_]*)\}/g;

/** Os nomes que um caso digita como ${NAME} e para os quais esta run não tem um valor. */
export function missingValuesOf(props: {
  steps: IFlatStep[];
  values: { name: string }[];
}): string[] {
  const written = props.steps.flatMap(({ action, expected, casePreconditions }) =>
    [action, expected, casePreconditions].flatMap((text) =>
      [...text.matchAll(NAMED)].map(([, name]) => name ?? ''),
    ),
  );

  return [...new Set(written)].filter(
    (name) => !props.values.some((value) => value.name === name),
  );
}
