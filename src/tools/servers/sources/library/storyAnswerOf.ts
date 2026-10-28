import type { IJiraStoryCopy } from '@/contract';
import { describeStory, renderSections } from '@/context/library';

/**
 * Uma story lida pela própria chamada do agente, com as mesmas palavras com que o /jira a
 * entrega.
 */
export function storyAnswerOf(story: IJiraStoryCopy): string {
  return renderSections([describeStory({ story, wasTold: false })]);
}
