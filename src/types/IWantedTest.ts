import type { ISuitePlanCase } from '@/contract';

/**
 * Um teste que o QA pede ao agente para escrever: o que ele deve conferir nas palavras do
 * QA, a pasta em que colocá-lo, '' para seguir a suíte, e o caso do plano que automatiza.
 */
export interface IWantedTest {
  text: string;
  folder: string;
  source: ISuitePlanCase | null;
}
