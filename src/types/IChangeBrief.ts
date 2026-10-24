import type { ChangeTask } from './ChangeTask';
import type { Language } from '@/contract';

/** What an agent changing a team's suite is handed: the suite's folder in its copy, the config and its projects, the branch it is on and where it came from, the team's latest commits, what it is there to do, the folders it may read, and the QA's language. */
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
