import type { IJiraFile } from './IJiraFile';
import type { IJiraStory } from './IJiraStory';
import type { StoryReadiness } from './StoryReadiness';

/**
 * Uma story do Jira lida para o agente planejar a partir dela, com a pasta dos arquivos
 * até o plano ser escrito, e se ela já chegou para teste.
 */
export interface IJiraStoryCopy {
  story: IJiraStory;
  root: string;
  files: IJiraFile[];
  readiness?: StoryReadiness;
}
