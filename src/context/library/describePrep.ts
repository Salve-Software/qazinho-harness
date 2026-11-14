import type { IFlatStep, IMemoryBrief, IVariableBrief, Language } from '@/contract';
import { LANGUAGE_NAMES } from '@/constants';
import { describeMemories } from './describeMemories';
import { describeVariables } from './describeVariables';

/**
 * A mensagem que prepara um caso que o QA anda à mão: só as pré-condições, com os passos
 * dele para o agente parar onde o QA começa.
 */
export function describePrep(props: {
  steps: IFlatStep[];
  screen: string;
  language: Language;
  variables: IVariableBrief[];
  memories?: IMemoryBrief[];
}): string {
  const { steps, screen, language, variables } = props;
  const [first] = steps;

  if (first === undefined || first.casePreconditions.trim().length === 0)
    return 'This case has nothing to prepare. End your turn.';

  return [
    `${first.caseId} · ${first.caseTitle}`,
    'The QA walks this case by hand, right after you. Your part is only to prepare it:',
    `1. ${first.casePreconditions.trim()}`,
    '   Bring the app there, then report step 1 passed, with the words on the screen that show it is ready.',
    '   If the app cannot get there, report step 1 blocked and say why: the QA prepares it.',
    '',
    'The steps the QA walks after you, which are not yours to carry out: stop where the first one starts.',
    ...steps.map((step) => `- ${step.action}`),
    '',
    `Write what you report in ${LANGUAGE_NAMES[language]}, whatever language these steps are in.`,
    ...describeVariables(variables),
    ...describeMemories({ memories: props.memories ?? [], heard: [] }),
    ...(screen.length === 0 ? [] : ['', 'The device shows right now:', screen]),
  ].join('\n');
}
