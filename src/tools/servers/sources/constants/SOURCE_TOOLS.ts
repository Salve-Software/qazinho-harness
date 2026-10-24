import { z } from 'zod';
import { textNamed } from '@/tools/library';

export const SOURCE_TOOLS = [
  {
    name: 'read_jira_story',
    description:
      "Read a Jira story through the QA's own Jira, the way /jira hands it to you: what it asks for, its acceptance criteria, the team's comments, the issues it links to, and the files attached, downloaded for you to read. Call it when the QA names a story by its key or its link.",
    input: z.object({
      story: textNamed({
        message: '"read_jira_story" needs "story": its key, such as HC-878, or its link.',
        description: 'The story, by its key such as HC-878, or the link to it.',
      }),
    }),
  },
  {
    name: 'search_confluence',
    description:
      "Find Confluence pages on the QA's site by words of their title, through the QA's own account. Answers with each page's id, title and space, the ones the QA worked on last first. Call it when the QA names a page without its link.",
    input: z.object({
      query: textNamed({
        message: '"search_confluence" needs "query": words of the page\'s title.',
        description: "Words of the page's title, such as CT-ABA Abas do preview.",
      }),
    }),
  },
  {
    name: 'read_confluence_page',
    description:
      "Read a Confluence page through the QA's own account, the way /confluence hands it to you: its title, space and whole text. Call it when the QA names a page by its link, or once search_confluence found the one they mean.",
    input: z.object({
      page: textNamed({
        message: '"read_confluence_page" needs "page": its id or its link.',
        description: 'The page, by the id search_confluence gave, or the link to it.',
      }),
    }),
  },
] as const;
