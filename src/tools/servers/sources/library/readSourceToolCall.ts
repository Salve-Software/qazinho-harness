import type { SourceToolRead } from '@/tools/servers/sources/types';
import { SOURCE_TOOLS } from '@/tools/servers/sources/constants';
import { confluencePageIdOf } from './confluencePageIdOf';
import { jiraKeyOf } from './jiraKeyOf';

/** Reads a source tool call against its schema, a story by its key and a page by its id; a call that names neither is refused with the reason. */
export function readSourceToolCall(props: {
  name: string;
  args: Record<string, unknown> | undefined;
}): SourceToolRead {
  const tool = SOURCE_TOOLS.find(({ name }) => name === props.name);

  if (!tool)
    return { kind: 'refused', error: `There is no tool called "${props.name}".` };

  const read = tool.input.safeParse(props.args ?? {});

  if (!read.success)
    return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Call it again.' };

  if ('query' in read.data)
    return { kind: 'call', call: { name: 'search_confluence', query: read.data.query } };

  if ('story' in read.data) {
    const key = jiraKeyOf(read.data.story);

    return key === null
      ? {
          kind: 'refused',
          error: `"${read.data.story}" names no Jira story: give its key, such as HC-878, or its link.`,
        }
      : { kind: 'call', call: { name: 'read_jira_story', key } };
  }

  const pageId = confluencePageIdOf(read.data.page);

  return pageId === null
    ? {
        kind: 'refused',
        error: `"${read.data.page}" names no Confluence page: give the id search_confluence found, or the page's link.`,
      }
    : { kind: 'call', call: { name: 'read_confluence_page', pageId } };
}
