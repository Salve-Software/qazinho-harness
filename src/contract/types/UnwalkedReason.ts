/**
 * Por que um passo não rodou: o anterior falhou, ficou sem relato, só havia gravações, a
 * IA acabou, o agente precisava do QA, faltou um dado, a conta não entrou, à mão, o fim.
 */
export type UnwalkedReason =
  | 'skipped'
  | 'unreported'
  | 'noAgent'
  | 'capped'
  | 'asked'
  | 'noValue'
  | 'noData'
  | 'signIn'
  | 'manual'
  | 'ended';
