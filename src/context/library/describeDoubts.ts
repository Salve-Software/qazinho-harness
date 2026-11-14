import type { IHarnessSection } from '@/context/types';
import type { IPlanDoubt } from '@/contract';
import { DOUBTS_SECTION } from '@/constants';

/**
 * As dúvidas do plano que foram à história, cada uma com como está e a resposta do time;
 * nada quando o plano não tem nenhuma.
 */
export function describeDoubts(doubts: IPlanDoubt[]): IHarnessSection {
  return {
    title: DOUBTS_SECTION.title,
    lines: doubts.flatMap(({ id, question, sent, answer }) => [
      `${id}, ${answer !== null ? `answered by ${answer.by || 'the team'}` : sent !== null ? 'asked on the story, no answer yet' : 'not asked on the story yet'}: ${question}`,
      ...(answer === null ? [] : quoted(`Answer: ${answer.text}`)),
    ]),
  };
}

function quoted(text: string): string[] {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}
