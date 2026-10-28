import type { IHarnessSection } from '@/context/types';
import type { IReviewBrief } from '@/types';

/**
 * Um bug visto de novo como o agente revisor o lê: a issue como o time a mantém agora, o
 * bug como o QAzinho o abriu, e cada vez que uma run o pegou de novo.
 */
export function describeReview(brief: IReviewBrief): IHarnessSection[] {
  const { issue, bug } = brief;

  return [
    {
      title: 'The issue',
      lines: [
        `${issue.key} · ${issue.title}`,
        `${issue.isClosed ? 'Closed' : 'Open'}${issue.status === '' ? '' : `, status "${issue.status}"`}. ${issue.url}`,
        ...(issue.body === ''
          ? ['It has no description.']
          : ['What it says:', ...quoted(issue.body)]),
        ...(issue.comments.length === 0
          ? ['Nobody commented on it yet.']
          : [
              'Its comments, oldest first:',
              ...issue.comments.flatMap(({ author, at, text }) =>
                quoted(`${author || 'Someone'}, ${at}: ${text}`),
              ),
            ]),
      ],
    },
    {
      title: 'The bug as QAzinho filed it',
      lines: [
        `"${bug.title}", caught on the case "${bug.caseTitle}".`,
        `Expected: ${bug.expected}`,
        `Got: ${bug.got}`,
        ...(bug.body.trim() === '' ? [] : [bug.body.trim()]),
      ],
    },
    {
      title: 'Caught again',
      lines: brief.sightings.flatMap((seen) => [
        `- ${seen.runId}, ${seen.runWhen}: ${seen.caseId} step ${String(seen.stepNumber)} "${seen.action}", on ${seen.target}.`,
        ...(seen.note.trim() === ''
          ? []
          : quoted(`What its agent noted: ${seen.note.trim()}`)),
        ...(seen.shot === null ? [] : [`  Its screen: ${seen.shot}`]),
        ...(seen.requests.length === 0
          ? []
          : [
              '  Requests that failed around it:',
              ...seen.requests.map((line) => `    ${line}`),
            ]),
      ]),
    },
  ];
}

function quoted(text: string): string[] {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}
