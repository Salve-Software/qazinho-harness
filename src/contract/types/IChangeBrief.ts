import type { IDraftedCase } from './IDraftedCase';
import type { IPlanDoubt } from './IPlanDoubt';
import type { ISourceChange } from './ISourceChange';
import type { Language } from './Language';

/** Com o que o leitor de uma mudança trabalha: o que mudou, os casos e as dúvidas. */
export interface IChangeBrief {
  changes: ISourceChange[];
  cases: (IDraftedCase & { id: string })[];
  doubts: IPlanDoubt[];
  language: Language;
}
