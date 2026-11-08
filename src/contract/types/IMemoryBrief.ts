import type { MemoryScope } from './MemoryScope';
import type { MemoryTarget } from './MemoryTarget';

/** Uma memória como o agente a lê: o id, o fato, até onde vale e em que alvo. */
export interface IMemoryBrief {
  id: string;
  text: string;
  scope: MemoryScope;
  target: MemoryTarget;
}
