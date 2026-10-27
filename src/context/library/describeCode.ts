import type { IHarnessSection } from '@/context/types';
import type { ICodeCopy } from '@/contract';
import { CODE_SECTION } from '@/constants';

/**
 * A branch's code as the agent reads it: the repository at its commit, where it sits, and
 * what it changed against the base.
 */
export function describeCode(props: {
  code: ICodeCopy | null;
  wasTold: boolean;
}): IHarnessSection {
  const { code } = props;
  const short = (sha: string) => sha.slice(0, CODE_SECTION.shaLength);

  if (code === null)
    return {
      title: CODE_SECTION.title,
      lines: props.wasTold
        ? [
            'The copy of the code is gone now that the plan is written. Plan from what you read, and ask the QA for what you did not.',
          ]
        : [],
    };

  const opening = [
    `Repository ${code.repository}, branch ${code.branch} at ${short(code.commit)}.`,
    `The code is at ${code.dir}. Read it with your tools; it is read only, and it is deleted once the plan is written.`,
  ];

  if (code.baseCommit === null)
    return {
      title: CODE_SECTION.title,
      lines: [
        ...opening,
        'This is the whole app on its base branch, with nothing to compare: plan across the app.',
      ],
    };

  const listed = code.changes.slice(0, CODE_SECTION.files);
  const unlisted = code.changedFiles - listed.length;

  return {
    title: CODE_SECTION.title,
    lines: [
      ...opening,
      `Against ${code.base} at ${short(code.baseCommit)}: ${count({ amount: code.commits, one: 'commit', many: 'commits' })}, ${count({ amount: code.changedFiles, one: 'file', many: 'files' })} changed.`,
      code.diffFile === null
        ? 'The diff was too large for GitHub to hand over; read the changed files instead.'
        : `The whole diff is at ${code.diffFile}.`,
      ...(listed.length === 0
        ? []
        : [
            'Changed files:',
            ...listed.map(
              (change) =>
                `  ${change.status} ${change.path} (+${String(change.additions)} -${String(change.deletions)})`,
            ),
          ]),
      ...(unlisted > 0
        ? [
            `  and ${count({ amount: unlisted, one: 'file', many: 'files' })} more in the diff.`,
          ]
        : []),
    ],
  };
}

const count = (props: { amount: number; one: string; many: string }) =>
  `${String(props.amount)} ${props.amount === 1 ? props.one : props.many}`;
