import type { IHarnessTools, IToolGrant } from '@/tools/types';
import type { HarnessRole } from '@/types';

/** The least a role needs: the groups granted to it, all behind QAzinho's one MCP server. */
export function toolsOfRole(props: {
  grants: readonly IToolGrant[];
  role: HarnessRole;
  server: string;
}): IHarnessTools {
  const groups = props.grants
    .filter((grant) => grant.roles.includes(props.role))
    .map((grant) => grant.group);

  return { groups, allowedTools: groups.length === 0 ? [] : [`mcp__${props.server}`] };
}
