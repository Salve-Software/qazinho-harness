import type { IStepChange } from './IStepChange';

/**
 * Um passo de uma run como a API o recebe: o que foi feito, como foi e por quê, o bug em
 * que quebrou, a chave da tela, quem o andou e onde fica no vídeo.
 */
export interface IRunStepBody {
  number: number;
  action: string;
  verdict: 'passed' | 'failed' | 'blocked' | 'skipped';
  why: string | null;
  bugId: string | null;
  shot: string | null;
  by: 'agent' | 'replay' | 'healed';
  proof: string | null;
  span: { from: number; to: number } | null;
  change?: IStepChange | null;
  askedQa?: boolean;
}
