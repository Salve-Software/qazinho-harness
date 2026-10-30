/**
 * Por que um passo não rodou: o anterior não se sustentou, ficou sem relato, só havia
 * gravações, a IA acabou, ou o agente precisava do QA.
 */
export type UnwalkedReason = 'skipped' | 'unreported' | 'noAgent' | 'capped' | 'asked';
