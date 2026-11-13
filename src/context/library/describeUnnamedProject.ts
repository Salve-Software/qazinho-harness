import type { IHarnessSection } from '@/context/types';
import { NAMING_SECTION } from '@/constants';

/** Pede o nome do app enquanto o projeto não tem um; nada depois que ele ganhou um. */
export function describeUnnamedProject(isUnnamed: boolean): IHarnessSection {
  return {
    title: NAMING_SECTION.title,
    lines: isUnnamed
      ? [
          'The project has no name yet: QAzinho shows it as "New project".',
          "Once what you read tells you the app's name (the story, the page, the design, the tests or the app itself), put it in projectName: the name the app goes by, in a few words, never a description of it. Leave projectName out while you do not know it.",
        ]
      : [],
  };
}
