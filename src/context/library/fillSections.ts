import type { IHarnessSection } from '@/context/types';

/**
 * Troca cada `{{name}}` do corpus pelo seu valor; um placeholder sem valor é erro de
 * digitação do corpus, e lança erro.
 */
export function fillSections(props: {
  sections: IHarnessSection[];
  values: Record<string, string>;
}): IHarnessSection[] {
  return props.sections.map((section) => ({
    ...section,
    lines: section.lines.map((line) =>
      line.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
        const value = props.values[name];

        if (value === undefined)
          throw new Error(
            `"${section.title}" asks for {{${name}}}, and nothing fills it.`,
          );

        return value;
      }),
    ),
  }));
}
