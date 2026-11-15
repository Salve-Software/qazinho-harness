import type { IMemoryBrief, IVariableBrief, Language } from '@/contract';
import { LANGUAGE_NAMES } from '@/constants';
import { describeMemories } from './describeMemories';
import { describeVariables } from './describeVariables';

/**
 * A mensagem que entra numa conta antes dos casos que começam dentro dela: só entrar, e
 * parar assim que o app mostra que entrou.
 */
export function describeSignIn(props: {
  account: string;
  screen: string;
  language: Language;
  variables: IVariableBrief[];
  memories?: IMemoryBrief[];
}): string {
  const { account, screen, language, variables } = props;

  return [
    `Sign in to the app with the account \${${account}}, and do nothing else: the cases of this plan start inside it.`,
    `1. Sign in as \${${account}}`,
    `   Type \${${account}} where the app asks for the account, and the variable that holds its password where it asks for one. A code the app sends somewhere else, such as by text message, you ask the QA for with ask_qa.`,
    '   Stop as soon as the app shows you are signed in, without opening another page, and report step 1 passed with the words on the screen that show it, such as the name of the account or a sign-out button.',
    '   If the app cannot sign you in, report step 1 blocked and say why.',
    '',
    `Write what you report in ${LANGUAGE_NAMES[language]}.`,
    ...describeVariables(variables),
    ...describeMemories({ memories: props.memories ?? [], heard: [] }),
    ...(screen.length === 0 ? [] : ['', 'The device shows right now:', screen]),
  ].join('\n');
}
