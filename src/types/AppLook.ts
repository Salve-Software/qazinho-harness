import type { TargetKind } from '@/contract';

/**
 * O que o QAzinho viu ao abrir o app em teste para o chat, num navegador ou num celular,
 * ou por que não conseguiu abri-lo.
 */
export type AppLook =
  | { kind: TargetKind; where: string; isOpen: true; page: string }
  | { kind: TargetKind; where: string; isOpen: false; reason: string };
