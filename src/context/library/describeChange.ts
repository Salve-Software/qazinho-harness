import type { IHarnessSection } from '@/context/types';
import type { IChangeBrief, ISourceChange } from '@/contract';
import { CHANGE_SECTION } from '@/constants';
import { describeDoubts } from './describeDoubts';

/**
 * Uma mudança como o leitor a pesa: o antes e o depois de cada fonte como dados, os casos
 * do plano com as fontes deles, e as dúvidas.
 */
export function describeChange(brief: IChangeBrief): IHarnessSection[] {
  return [
    { title: 'What changed', lines: brief.changes.flatMap(linesOf) },
    {
      title: 'The plan',
      lines: brief.cases.flatMap((one) => [
        `Case ${one.id} "${one.title}" (${one.priority})${(one.sources ?? []).length === 0 ? '' : `, from ${(one.sources ?? []).join(', ')}`}${(one.blockedBy ?? []).length === 0 ? '' : `, waits on ${(one.blockedBy ?? []).join(', ')}`}`,
        ...(one.goal === '' ? [] : [`  Goal: ${one.goal}`]),
        ...(one.preconditions === '' ? [] : [`  Before: ${one.preconditions}`]),
        ...one.steps.map(
          (step, index) =>
            `  ${String(index + 1)}. ${step.action}${step.expected === '' ? '' : ` → ${step.expected}`}`,
        ),
      ]),
    },
    describeDoubts(brief.doubts),
  ];
}

function linesOf(change: ISourceChange): string[] {
  if (change.kind === 'code') {
    let room: number = CHANGE_SECTION.totalPatchLines;

    return [
      `The branch ${change.branch} of ${change.repository} moved from ${change.from.slice(0, 7)} to ${change.to.slice(0, 7)}:`,
      ...change.files.flatMap((file) => {
        const lines = file.patch
          .split('\n')
          .slice(0, Math.min(CHANGE_SECTION.patchLines, room))
          .map((line) => `    ${line}`);

        room = Math.max(0, room - lines.length);

        return [`  - ${file.path}`, ...lines];
      }),
    ];
  }

  return [
    change.kind === 'story'
      ? `The story ${change.key}, edited ${change.at}. ${change.url}`
      : `The page "${change.title}", edited ${change.at}. ${change.url}`,
    'Before:',
    ...quoted(cut(change.before, CHANGE_SECTION.textChars)),
    'After:',
    ...quoted(cut(change.after, CHANGE_SECTION.textChars)),
    ...(change.kind === 'page' || change.comments.length === 0
      ? []
      : [
          'New comments, oldest first:',
          ...change.comments.flatMap(({ author, at, text }) =>
            quoted(
              `${author || 'Someone'}, ${at}: ${cut(text, CHANGE_SECTION.commentChars)}`,
            ),
          ),
        ]),
  ];
}

function cut(text: string, chars: number): string {
  return text.length > chars ? `${text.slice(0, chars)}\n(the rest is cut)` : text;
}

function quoted(text: string): string[] {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}
