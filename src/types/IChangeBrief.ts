import type { ChangeTask } from './ChangeTask';
import type { Language } from '@/contract';

/**
 * What an agent changing a team's suite is handed: its copy, config, branch, recent
 * commits and the task.
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
