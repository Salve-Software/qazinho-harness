import type { IHarnessSection } from '@/context/types';
import { renderSections } from './renderSections';

/**
 * The QA's message as the agent reads it: what QAzinho has to tell, inside <qazinho>,
 * then the QA's own words.
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
