import type { IDesignLink, IKnownBug, IVariableBrief } from '@/contract';
import { describeKnownBugs } from './describeKnownBugs';
import { describeVariables } from './describeVariables';

/**
 * A mensagem que começa uma exploração: o tempo, o design do Figma, as variáveis, os bugs
 * abertos e a tela.
 */
export function describeExploration(props: {
  minutes: number;
  screen: string;
  variables: IVariableBrief[];
  known: IKnownBug[];
  design: IDesignLink | null;
}): string {
  const { minutes, screen, variables, known, design } = props;

  return [
    `Explore the app for ${String(minutes)} minutes: note each screen the first time you reach it, file what is wrong, and call finish before the time is up.`,
    ...(design === null
      ? []
      : [
          `Figma design: ${design.url} (fileKey ${design.fileKey}${design.nodeId === null ? '' : `, node ${design.nodeId}`}). Hold each screen it draws to its frame.`,
        ]),
    ...describeVariables(variables),
    ...describeKnownBugs(known),
    ...(screen.length === 0 ? [] : ['', 'The device shows right now:', screen]),
  ].join('\n');
}
