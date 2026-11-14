import type { IHarnessSection } from '@/context/types';
import type { IJiraFile, IJiraStoryCopy } from '@/contract';
import { STORY_SECTION } from '@/constants';
import { criteriaOf } from './criteriaOf';

const KILOBYTE = 1_024;

/**
 * Uma story do Jira como o agente que planeja a lê: o que pede, os critérios numerados, o
 * que o time disse, se já chegou para teste, a que se liga, e onde estão os arquivos.
 */
export function describeStory(props: {
  story: IJiraStoryCopy | null;
  wasTold: boolean;
}): IHarnessSection {
  const copy = props.story;

  if (copy === null)
    return {
      title: STORY_SECTION.title,
      lines: props.wasTold
        ? [
            "The story's files are gone now that the plan is written. Plan from what you read, and ask the QA for what you did not.",
          ]
        : [],
    };

  const { story } = copy;
  const facts = [
    story.type,
    story.status,
    story.priority === '' ? '' : `priority ${story.priority}`,
  ]
    .filter((fact) => fact.length > 0)
    .join(', ');
  const criteria = criteriaOf(story.acceptance);
  const description =
    story.description.length > STORY_SECTION.descriptionChars
      ? `${story.description.slice(0, STORY_SECTION.descriptionChars)}\n(the rest is cut)`
      : story.description;

  return {
    title: STORY_SECTION.title,
    lines: [
      `${story.key} · ${story.summary}`,
      `${facts === '' ? '' : `${facts}. `}${story.url}`,
      ...(copy.readiness === undefined ? [] : [STORY_SECTION.readiness[copy.readiness]]),
      ...(story.parent === '' ? [] : [`Part of ${story.parent}.`]),
      ...(story.labels.length === 0 ? [] : [`Labels: ${story.labels.join(', ')}.`]),
      ...(story.components.length === 0
        ? []
        : [`Components: ${story.components.join(', ')}.`]),
      ...(description === ''
        ? ['The story has no description.']
        : ['Description:', ...quoted(description)]),
      ...(criteria.length === 0
        ? []
        : [
            STORY_SECTION.criteria,
            ...criteria.flatMap((text, index) =>
              quoted(`C${String(index + 1)}. ${text}`),
            ),
          ]),
      ...(story.comments.length === 0
        ? []
        : [
            'What the team said in its comments, oldest first:',
            ...story.comments.flatMap(({ author, at, text }) =>
              quoted(`${author || 'Someone'}, ${at}: ${text}`),
            ),
          ]),
      ...(story.links.length === 0
        ? []
        : ['Linked issues:', ...story.links.map((link) => `- ${link}`)]),
      ...(story.subtasks.length === 0
        ? []
        : ['Subtasks:', ...story.subtasks.map((subtask) => `- ${subtask}`)]),
      ...(copy.files.length === 0
        ? []
        : [
            copy.files.some(({ path }) => path !== null)
              ? 'Files attached to the story, downloaded for you to read with your tools; they are deleted once the plan is written:'
              : 'Files attached to the story:',
            ...copy.files.map(fileLine),
          ]),
    ],
  };
}

function sizeOf(bytes: number): string {
  return bytes < KILOBYTE * KILOBYTE
    ? `${String(Math.max(1, Math.round(bytes / KILOBYTE)))} KB`
    : `${(bytes / KILOBYTE / KILOBYTE).toFixed(1)} MB`;
}

function quoted(text: string): string[] {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}

function fileLine(file: IJiraFile): string {
  const named = `- ${file.filename} (${file.mimeType || 'unknown kind'}, ${sizeOf(file.size)})`;

  if (file.path !== null) return `${named} at ${file.path}`;
  if (file.note === 'not-readable')
    return `${named}: not downloaded, a kind you cannot read`;
  if (file.note === 'too-large') return `${named}: not downloaded, too large`;
  if (file.note === 'too-many') return `${named}: not downloaded, too many files`;

  return `${named}: Jira did not hand it over`;
}
