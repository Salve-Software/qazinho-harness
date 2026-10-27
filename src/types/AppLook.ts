import type { TargetKind } from '@/contract';

/**
 * What QAzinho saw when it opened the app under test for the chat, in a browser or on a
 * phone, or why it could not open it.
 */
export type AppLook =
  | { kind: TargetKind; where: string; isOpen: true; page: string }
  | { kind: TargetKind; where: string; isOpen: false; reason: string };
