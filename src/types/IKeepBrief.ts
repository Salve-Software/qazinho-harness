import type { IMemoryBrief, KeepEvent, Language } from '@/contract';

/** Com o que o agente decide o que guardar: as memórias de agora e o que aconteceu. */
export interface IKeepBrief {
  memories: IMemoryBrief[];
  events: KeepEvent[];
  language: Language;
}
