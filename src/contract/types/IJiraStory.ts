import type { IJiraAttachment } from './IJiraAttachment';

/**
 * Uma issue do Jira como o agente que planeja a lê: o que ela é e pede, como é aceita, o
 * que o time disse dela, a que se liga, e os arquivos.
 */
export interface IJiraStory {
  key: string;
  url: string;
  summary: string;
  type: string;
  status: string;
  priority: string;
  labels: string[];
  components: string[];
  parent: string;
  description: string;
  acceptance: { field: string; text: string }[];
  comments: { author: string; at: string; text: string }[];
  links: string[];
  subtasks: string[];
  attachments: IJiraAttachment[];
}
