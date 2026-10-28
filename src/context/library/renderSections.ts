import type { IHarnessSection } from '@/context/types';

/** O system prompt como o agente o lê: blocos com título, na ordem dada. */
export function renderSections(sections: IHarnessSection[]): string {
  return sections
    .filter((section) => section.lines.length > 0)
    .map((section) => `## ${section.title}\n${section.lines.join('\n')}`)
    .join('\n\n');
}
