import type { IDraftedCase } from './IDraftedCase';

/**
 * O que o leitor de uma mudança propõe: o que mudou numa frase, cada caso tocado como
 * fica, os casos novos, as dúvidas novas e as que a mudança respondeu.
 */
export interface IChangeRead {
  summary: string;
  changes: { caseId: string; why: string; case: IDraftedCase }[];
  added: { why: string; case: IDraftedCase }[];
  doubts: string[];
  answered: { doubtId: string; text: string }[];
}
