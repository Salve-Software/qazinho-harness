import type {
  IDesignLink,
  IFlatStep,
  IKnownBug,
  IVariableBrief,
  Language,
} from '@/contract';
import { LANGUAGE_NAMES } from '@/constants';
import { describeKnownBugs } from './describeKnownBugs';
import { describeVariables } from './describeVariables';

/** One case to walk, as the message that starts the agent's turn: its steps in order with the Figma frame each should match, the language to report in, the variables it may type, what the QA already answered in this run, the bugs already open and filed, and the screen it starts on. */
export function describeCase(props: {
  steps: IFlatStep[];
  screen: string;
  language: Language;
  filed: string[];
  known: IKnownBug[];
  variables: IVariableBrief[];
  design: IDesignLink | null;
  told?: { question: string; answer: string }[];
}): string {
  const { steps, screen, language, filed, known, variables, design } = props;
  const told = props.told ?? [];
  const [first] = steps;
  const framed = design !== null && steps.some(({ frame }) => frame !== undefined);

  if (first === undefined) return 'This case has no steps. End your turn.';

  return [
    `${first.caseId} · ${first.caseTitle}`,
    ...(first.caseGoal.length > 0 ? [`Goal: ${first.caseGoal}`] : []),
    ...(first.casePreconditions.length > 0
      ? [`Preconditions: ${first.casePreconditions}`]
      : []),
    ...(framed
      ? [
          `Figma design: ${design.url} (fileKey ${design.fileKey}). Hold each step that names a frame to it.`,
        ]
      : []),
    'Carry out these steps in order, and report each one as soon as you judged it:',
    ...steps.flatMap((step) => [
      `${String(step.numberInCase)}. ${step.action}`,
      `   The QA expects: ${step.expected}`,
      ...(framed && step.frame !== undefined
        ? [`   Its screen should match Figma frame ${step.frame}.`]
        : []),
    ]),
    `Write what you report and note in ${LANGUAGE_NAMES[language]}, whatever language these steps are in.`,
    ...describeVariables(variables),
    ...(told.length === 0
      ? []
      : [
          '',
          'What the QA already answered in this run, which holds for this case too: use it instead of asking again.',
          ...told.flatMap(({ question, answer }) => [`- ${question}`, `  ${answer}`]),
        ]),
    ...describeKnownBugs(known),
    ...(filed.length === 0
      ? []
      : [
          '',
          'Bugs this run already filed, not to file again; they have no id yet, so a step that fails for one is reported with its title:',
          ...filed.map((title) => `- ${title}`),
        ]),
    ...(screen.length === 0 ? [] : ['', 'The device shows right now:', screen]),
  ].join('\n');
}
