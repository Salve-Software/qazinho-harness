import type { IHarnessSection } from '@/context/types';

/**
 * The sections the agent has not read as they are now, and what it will have read, by
 * title, once it gets them.
 */
export function changedSections(props: {
  sections: IHarnessSection[];
  told: Record<string, string>;
}): { changed: IHarnessSection[]; told: Record<string, string> } {
  const told = { ...props.told };
  const changed: IHarnessSection[] = [];

  for (const section of props.sections) {
    const text = section.lines.join('\n');

    if (told[section.title] === text) continue;

    told[section.title] = text;

    if (text.length > 0) changed.push(section);
  }

  return { changed, told };
}
