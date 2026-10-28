import type { IHarnessSection } from '@/context/types';

/**
 * As seções que o agente não leu como estão agora, e o que ele terá lido, por título,
 * quando recebê-las.
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
