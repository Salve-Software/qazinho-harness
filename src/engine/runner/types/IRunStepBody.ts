import type { IStepChange } from './IStepChange';
import type { IStepAsked } from '@/contract';

/**
 * Um passo de uma run como a API o recebe: o que foi feito, como foi e por quê, o bug em
 * que quebrou, a chave da tela, quem o andou, onde fica no vídeo e se é de um caso à mão.
 */
export interface IRunStepBody {
  number: number;
  action: string;
  verdict: 'passed' | 'failed' | 'blocked' | 'skipped';
  why: string | null;
  bugId: string | null;
  shot: string | null;
  by: 'agent' | 'replay' | 'healed' | 'qa';
  proof: string | null;
  span: { from: number; to: number } | null;
  change?: IStepChange | null;
  askedQa?: boolean;
  isManual?: boolean;
  asked?: IStepAsked;
}
