import type { IHarnessTools, IToolGrant } from '@/tools/types';
import type { HarnessRole } from '@/types';

/**
 * O mínimo de que um papel precisa: os grupos liberados para ele, todos atrás do único
 * servidor MCP do QAzinho.
 */
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
