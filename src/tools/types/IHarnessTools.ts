import type { ToolGroup } from './ToolGroup';

/**
 * As ferramentas que um papel recebe: os grupos que o QAzinho serve a ele, e os nomes que
 * a CLI do agente pode chamar.
 */
export interface IHarnessTools {
  groups: ToolGroup[];
  allowedTools: string[];
}
