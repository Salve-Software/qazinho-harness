import type { IHarnessSection } from '@/context/types';
import type { IChatReference } from '@/contract';

/** What the QA pointed at with @, as a section the agent explains from. */
export function describeReferences(references: IChatReference[]): IHarnessSection {
  return {
    title: 'What the QA pointed at',
    lines: references.flatMap((reference) => [
      `${reference.kind} ${reference.id} · ${reference.title}`,
      ...reference.facts.map((fact) => `  ${fact}`),
    ]),
  };
}
