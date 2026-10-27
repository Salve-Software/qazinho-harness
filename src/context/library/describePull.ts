import type { IHarnessSection } from '@/context/types';
import type { IPullBrief } from '@/types';
import { PULL_SECTION } from '@/constants';

function quoted(text: string): string[] {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}

function patchLines(props: { patch: string | null; room: number }): string[] {
  if (props.patch === null)
    return ['  (no patch: a binary file, or one too large to show)'];

  const lines = props.patch.split('\n');
  const kept = lines.slice(0, Math.min(PULL_SECTION.patchLines, props.room));

  return [
    ...quoted(kept.join('\n')),
    ...(kept.length < lines.length ? ['  (the rest of this file is cut)'] : []),
  ];
}

/** A pull request as the reader weighs it: the PR as its team wrote it and the issue it closes, quoted as data, each file's patch cut to a budget, the plans by id, what QAzinho already found, and the cases the team asked for, one a line. */
export function describePull(brief: IPullBrief): IHarnessSection[] {
  const { pull } = brief;
  const body =
    pull.body.length > PULL_SECTION.bodyChars
      ? `${pull.body.slice(0, PULL_SECTION.bodyChars)}\n(the rest is cut)`
      : pull.body;
  let room: number = PULL_SECTION.totalPatchLines;
  const files = brief.files.flatMap((file) => {
    const lines = patchLines({ patch: file.patch, room });

    room = Math.max(0, room - lines.length);

    return [
      `- ${file.path} (${file.status})`,
      ...(room === 0 && lines.length === 0 ? [] : lines),
    ];
  });

  return [
    {
      title: 'The pull request',
      lines: [
        `${pull.repository} #${String(pull.number)} · ${pull.headBranch} into ${pull.baseBranch}`,
        'Its title:',
        ...quoted(pull.title),
        ...(body.trim() === ''
          ? ['It has no description.']
          : ['Its description:', ...quoted(body)]),
      ],
    },
    {
      title: 'The issue it closes',
      lines:
        brief.issue === null
          ? []
          : [
              `#${String(brief.issue.number)}`,
              ...quoted(brief.issue.title),
              ...(brief.issue.body.trim() === '' ? [] : quoted(brief.issue.body)),
            ],
    },
    { title: 'What it changes', lines: files },
    {
      title: 'The plans',
      lines: brief.plans.flatMap((plan) => [
        `Plan "${plan.name}" (${plan.id})`,
        ...plan.cases.flatMap((one) => [
          `  Case ${one.id} "${one.title}"${one.goal === '' ? '' : `: ${one.goal}`}`,
          ...one.steps.map(
            (step, index) =>
              `    ${String(index + 1)}. ${step.action}${step.expected === '' ? '' : ` → ${step.expected}`}`,
          ),
        ]),
      ]),
    },
    {
      title: 'Found',
      lines: brief.found.map(
        (found) =>
          `- plan ${found.planId}, case ${found.caseId}, step ${String(found.step)}: "${found.text}" is gone from ${found.file}${found.replacement === null ? '' : `, where "${found.replacement}" took its place`}`,
      ),
    },
    {
      title: 'What the team asks for',
      lines:
        brief.asked.length === 0
          ? []
          : [
              'Someone on the team asked on the pull request for these cases:',
              ...brief.asked.map(
                (text) =>
                  `  - ${text
                    .replace(/<\/?qazinho>/gi, '[qazinho]')
                    .replace(/\s+/g, ' ')
                    .trim()}`,
              ),
            ],
    },
  ];
}
