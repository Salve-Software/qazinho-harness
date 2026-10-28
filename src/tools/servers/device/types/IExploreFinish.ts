import type { IDraftedCase } from '@/contract';

/**
 * Como uma exploração terminou, nas palavras do explorador: o que explorou e como foi, e
 * os casos que ele sugere para um plano.
 */
export interface IExploreFinish {
  summary: string;
  cases: IDraftedCase[];
}
