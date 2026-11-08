import type {
  IDesignLink,
  IFlatStep,
  IKnownBug,
  IMemoryBrief,
  IVariableBrief,
} from '@/contract';
import { describeKnownBugs } from './describeKnownBugs';
import { describeMemories } from './describeMemories';
import { describeVariables } from './describeVariables';

/**
 * A mensagem que começa uma exploração: o tempo, o design, as variáveis, o que o plano já
 * cobre, os bugs conhecidos e a tela.
 */
export function describeExploration(props: {
  minutes: number;
  screen: string;
  variables: IVariableBrief[];
  known: IKnownBug[];
  design: IDesignLink | null;
  plan?: IFlatStep[];
  memories?: IMemoryBrief[];
}): string {
  const { minutes, screen, variables, known, design } = props;
  const cases = [
    ...new Map((props.plan ?? []).map((step) => [step.caseId, step])).values(),
  ];

  return [
    `Explore the app for ${String(minutes)} minutes: note each screen the first time you reach it, file what is wrong, and call finish before the time is up.`,
    ...(design === null
      ? []
      : [
          `Figma design: ${design.url} (fileKey ${design.fileKey}${design.nodeId === null ? '' : `, node ${design.nodeId}`}). Hold each screen it draws to its frame.`,
        ]),
    ...describeVariables(variables),
    ...describeMemories({ memories: props.memories ?? [] }),
    ...(cases.length === 0
      ? []
      : [
          '',
          'The workspace plan already has these cases. What they name, such as a coupon, an account or a rule, is how the app works: use it, and ask the QA only what none of them says.',
          ...cases.map(
            (one) =>
              `- ${one.caseId} · ${one.caseTitle}${one.casePreconditions.length === 0 ? '' : ` (${one.casePreconditions})`}`,
          ),
        ]),
    ...describeKnownBugs(known),
    ...(screen.length === 0 ? [] : ['', 'The device shows right now:', screen]),
  ].join('\n');
}
