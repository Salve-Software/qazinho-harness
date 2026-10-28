import type { IHarnessSection } from '@/context/types';
import type { IChatReference } from '@/contract';

/** O que o QA apontou com @, como uma seção a partir da qual o agente explica. */
export function describeReferences(references: IChatReference[]): IHarnessSection {
  return {
    title: 'What the QA pointed at',
    lines: references.flatMap((reference) => [
      `${reference.kind} ${reference.id} · ${reference.title}`,
      ...reference.facts.map((fact) => `  ${fact}`),
    ]),
  };
}
