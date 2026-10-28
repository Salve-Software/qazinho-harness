import type { ChangeTask } from './ChangeTask';
import type { Language } from '@/contract';

/**
 * O que um agente que muda a suíte de um time recebe: a cópia, a config, a branch, os
 * commits recentes e a tarefa.
 */
export interface IChangeBrief {
  dir: string;
  config: string;
  projects: string[];
  branch: string;
  base: string;
  commit: string;
  commits: string[];
  task: ChangeTask;
  readDirs: string[];
  language: Language;
}
