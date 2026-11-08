import type { MemoryScope } from './MemoryScope';
import type { MemoryTarget } from './MemoryTarget';

/** Uma mudança no que o agente guarda: uma memória nova, outra corrigida ou esquecida. */
export type MemoryOp =
  | { op: 'add'; text: string; scope: MemoryScope; target: MemoryTarget }
  | { op: 'replace'; id: string; text: string; target?: MemoryTarget }
  | { op: 'delete'; id: string };
