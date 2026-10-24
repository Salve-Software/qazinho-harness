import type { IJiraStoryCopy } from '@/contract';
import { describeStory, renderSections } from '@/context/library';

/** A story read by the agent's own call, in the very words /jira hands it over. */
export function storyAnswerOf(story: IJiraStoryCopy): string {
  return renderSections([describeStory({ story, wasTold: false })]);
}
