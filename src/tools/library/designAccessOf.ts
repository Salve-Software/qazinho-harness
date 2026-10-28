import type { IDesignLink } from '@/contract';
import type { IDesignAccess } from '@/tools/types';
import { DESIGN_TOOLS, FIGMA_MCP } from '@/tools/constants';

/**
 * O servidor Figma do QA e as ferramentas de leitura dele quando o workspace tem design,
 * e nada quando não tem.
 */
export function designAccessOf(design: IDesignLink | null): IDesignAccess {
  return design === null
    ? { servers: [], allowedTools: [] }
    : {
        servers: [{ name: FIGMA_MCP.name, url: FIGMA_MCP.url }],
        allowedTools: DESIGN_TOOLS.map((tool) => `mcp__${FIGMA_MCP.name}__${tool}`),
      };
}
