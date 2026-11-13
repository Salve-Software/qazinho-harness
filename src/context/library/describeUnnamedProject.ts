import type { IHarnessSection } from '@/context/types';
import { NAMING_SECTION } from '@/constants';

/** Pede um nome ao projeto enquanto ele não tem um; nada depois que ele ganhou um. */
export function describeUnnamedProject(isUnnamed: boolean): IHarnessSection {
  return {
    title: NAMING_SECTION.title,
    lines: isUnnamed
      ? [
          'The project has no name yet: QAzinho shows it as "New project". Give it one in projectName, in this answer.',
          'Use the app\'s name when anything you read says it: the story, the page, the design, the tests or the app itself. When nothing says it, name what is being tested in two or three words of the QA\'s language, the way a team would call the project, like "Checkout" or "Online shop". Never a sentence.',
        ]
      : [],
  };
}
