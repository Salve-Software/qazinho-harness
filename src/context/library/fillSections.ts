import type { IHarnessSection } from '@/context/types';

/** Puts each `{{name}}` of the corpus in its value; a placeholder with no value is a corpus typo, and throws. */
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
