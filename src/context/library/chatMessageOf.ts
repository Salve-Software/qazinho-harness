import type { IHarnessSection } from '@/context/types';
import { renderSections } from './renderSections';

/**
 * A mensagem do QA como o agente a lê: o que o QAzinho tem a dizer, dentro de <qazinho>,
 * depois as palavras do próprio QA.
 */
export function chatMessageOf(props: {
  sections: IHarnessSection[];
  text: string;
}): string {
  const told = renderSections(props.sections);

  return told.length === 0
    ? props.text
    : `<qazinho>\n${told}\n</qazinho>\n\n${props.text}`;
}
