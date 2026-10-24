import type { IHarnessSection } from '@/context/types';
import type { AppLook } from '@/types';

const DEVICES = { android: 'an Android emulator', ios: 'an iOS simulator' } as const;

/** What QAzinho saw of the app before the message, as a section the agent asks from; nothing when it did not look. */
export function describeLook(look: AppLook | null): IHarnessSection {
  const title = 'What QAzinho saw of the app';

  if (look === null) return { title, lines: [] };

  if (look.kind === 'web')
    return {
      title,
      lines: look.isOpen
        ? [
            `QAzinho opened ${look.where} in a browser before this message, and the pages its menu leads to. They read:`,
            ...look.page.split('\n'),
          ]
        : [
            `QAzinho tried to open ${look.where} before this message and could not: ${look.reason}`,
          ],
    };

  return {
    title,
    lines: look.isOpen
      ? [
          `QAzinho installed ${look.where} on ${DEVICES[look.kind]} before this message and opened it as on the day it was installed. Only its first screen was read, nothing was tapped:`,
          ...look.page.split('\n'),
        ]
      : [
          `QAzinho tried to open ${look.where} on ${DEVICES[look.kind]} before this message and could not: ${look.reason}`,
        ],
  };
}
