import type { IJiraFile } from './IJiraFile';
import type { IJiraStory } from './IJiraStory';

/** A Jira story read for the agent to plan from, with the folder its files were downloaded to, until the plan is written. */
export interface IJiraStoryCopy {
  story: IJiraStory;
  root: string;
  files: IJiraFile[];
}
