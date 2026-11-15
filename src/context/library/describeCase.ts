import type {
  IDesignLink,
  IFlatStep,
  IKnownBug,
  IMemoryBrief,
  IVariableBrief,
  Language,
} from '@/contract';
import { LANGUAGE_NAMES } from '@/constants';
import { describeKnownBugs } from './describeKnownBugs';
import { describeMemories } from './describeMemories';
import { describeVariables } from './describeVariables';

/**
 * A mensagem que começa um caso: a conta em que ele já começa, os passos e frames, o
 * idioma, as variáveis, o que se aprendeu do app, as respostas dadas e os bugs abertos.
 */
export function describeCase(props: {
  steps: IFlatStep[];
  screen: string;
  language: Language;
  filed: string[];
  known: IKnownBug[];
  variables: IVariableBrief[];
  design: IDesignLink | null;
  told?: { question: string; answer: string }[];
  isUnderWay?: boolean;
  memories?: IMemoryBrief[];
  heardMemories?: string[];
  uploads?: { name: string; path: string }[];
  uploadsAreSamples?: boolean;
  signedInAs?: string | null;
}): string {
  const { steps, screen, language, filed, known, variables, design } = props;
  const told = props.told ?? [];
  const uploads = props.uploads ?? [];
  const [first] = steps;
  const framed = design !== null && steps.some(({ frame }) => frame !== undefined);

  if (first === undefined) return 'This case has no steps. End your turn.';

  return [
    `${first.caseId} · ${first.caseTitle}`,
    ...(first.caseGoal.length > 0 ? [`Goal: ${first.caseGoal}`] : []),
    ...(props.isUnderWay === true
      ? [
          'This case is already under way: the steps before these are done, and the app is where the last one left it. Do not prepare anything again: go on from the screen below.',
        ]
      : first.casePreconditions.length > 0
        ? [`Preconditions: ${first.casePreconditions}`]
        : []),
    ...(props.isUnderWay !== true &&
    props.signedInAs !== undefined &&
    props.signedInAs !== null
      ? [
          `You start signed in as \${${props.signedInAs}}: the run already did that part of the preconditions, so do not sign in again. If the app asks you to sign in anyway, sign in with \${${props.signedInAs}} once and say so in "note".`,
        ]
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
    ...(props.uploadsAreSamples === true
      ? [
          '',
          'This machine holds none of the files the QA picked: upload with "paths" picks a sample of the same type under the same name. Judge only that the app took it, never what the file holds.',
        ]
      : []),
    ...(uploads.length === 0
      ? []
      : [
          '',
          'Files of this plan, to pick with upload when a step needs one:',
          ...uploads.map(({ name, path }) => `- ${name}: ${path}`),
        ]),
    ...describeMemories({
      memories: props.memories ?? [],
      heard: props.heardMemories ?? [],
    }),
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
