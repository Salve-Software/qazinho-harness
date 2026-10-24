import type { IHarnessSection } from '@/context/types';
import type { IBrokenTest, IChangeBrief, IWantedTest } from '@/types';

function brokenOf(broken: IBrokenTest): IHarnessSection {
  return {
    title: 'The test that broke',
    lines: [
      `${broken.title}, written in ${broken.file}:${String(broken.line)}${
        broken.path.length === 0
          ? ''
          : `, inside ${broken.path.map((describe) => `"${describe}"`).join(' and ')}`
      }.`,
      ...(broken.project === ''
        ? []
        : [`It runs in the Playwright project ${broken.project}.`]),
      'It failed with:',
      '```',
      broken.error,
      '```',
      ...(broken.notes === ''
        ? []
        : [
            'What Playwright noted of the page and the test when it failed:',
            '````markdown',
            broken.notes,
            '````',
          ]),
      ...(broken.screenshots.length === 0
        ? []
        : [`Its screenshot: ${broken.screenshots.join(', ')}`]),
    ],
  };
}

function wantedOf(wanted: IWantedTest): IHarnessSection {
  const { source } = wanted;

  return {
    title: 'The test to write',
    lines: [
      ...(wanted.text === '' ? [] : [`The QA asks for a new test: ${wanted.text}`]),
      ...(source === null
        ? []
        : [
            `It automates the case ${source.id} · ${source.title}, from the plan of the workspace "${source.workspace}".`,
            ...(source.goal === '' ? [] : [`Its goal: ${source.goal}`]),
            ...(source.preconditions === ''
              ? []
              : [`What it needs before its first step: ${source.preconditions}`]),
            'Its steps, each with what the QA expects:',
            ...source.steps.map(
              (step, index) =>
                `${String(index + 1)}. ${step.action} Expect: ${step.expected}`,
            ),
          ]),
      wanted.folder === ''
        ? 'Put it where the suite keeps tests like it.'
        : `Put it in ${wanted.folder}.`,
    ],
  };
}

/** The team's suite and what the agent is there to do in it, a test that broke or one to write, as the sections it reads before it starts. */
export function describeChange(
  props: Omit<IChangeBrief, 'readDirs' | 'language'>,
): IHarnessSection[] {
  return [
    {
      title: "The team's suite",
      lines: [
        `The suite is in ${props.dir}: read and change files there, and nowhere else.`,
        props.projects.length === 0
          ? `Its config is ${props.config}, with no Playwright project of its own.`
          : `Its config is ${props.config}, with the Playwright projects ${props.projects.join(', ')}.`,
        `This copy is on the branch ${props.branch}, made from ${props.base === '' ? 'a commit with no branch' : props.base} at commit ${props.commit.slice(0, 7)}.`,
        ...(props.commits.length === 0
          ? []
          : [
              "The team's latest commit messages:",
              ...props.commits.map((one) => `- ${one}`),
            ]),
      ],
    },
    props.task.kind === 'fix' ? brokenOf(props.task.broken) : wantedOf(props.task.wanted),
  ];
}
