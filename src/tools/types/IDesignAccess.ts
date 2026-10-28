import type { IAgentServer } from './IAgentServer';

/**
 * O que uma chamada precisa para ler o design do Figma do workspace: o servidor Figma do
 * QA, e só as ferramentas dele que leem.
 */
export interface IDesignAccess {
  servers: IAgentServer[];
  allowedTools: string[];
}
