import type { ToolGroup } from './ToolGroup';

/** The tools a role gets: the groups QAzinho serves it, and the names the agent's CLI may call. */
export interface IHarnessTools {
  groups: ToolGroup[];
  allowedTools: string[];
}
