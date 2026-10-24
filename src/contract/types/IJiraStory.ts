import type { IJiraAttachment } from './IJiraAttachment';

/** A Jira issue as the planning agent reads it: what it is and asks for, how it is accepted, what the team said of it, what it links to, and its files. */
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
