import type { IJiraFile } from './IJiraFile';
import type { IJiraStory } from './IJiraStory';

/**
 * Uma story do Jira lida para o agente planejar a partir dela, com a pasta para onde os
 * arquivos foram baixados, até o plano ser escrito.
 */
export interface IJiraStoryCopy {
  story: IJiraStory;
  root: string;
  files: IJiraFile[];
}
