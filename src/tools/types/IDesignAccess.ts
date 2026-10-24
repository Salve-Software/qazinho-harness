import type { IAgentServer } from './IAgentServer';

/** What a call needs to read the workspace's Figma design: the QA's Figma server, and only the tools of it that read. */
export interface IDesignAccess {
  servers: IAgentServer[];
  allowedTools: string[];
}
