import type { IAppProjectBrief } from './IAppProjectBrief';
import type { IAppWorkspaceBrief } from './IAppWorkspaceBrief';
import type { IntegrationId } from './IntegrationId';
import type { Language } from './Language';

/**
 * O QAzinho como o assistente o lê com uma mensagem: o que está na tela, como o QA o
 * configurou, e cada projeto e workspace.
 */
export interface IAppSnapshot {
  screen: 'home' | 'workspace' | 'settings';
  openWorkspaceId: string | null;
  openTab: 'plan' | 'device' | 'runs' | 'bugs' | null;
  openRunId: string | null;
  openBugId: string | null;
  language: Language;
  theme: 'night' | 'paper' | 'system';
  runAlert: 'system' | 'app';
  agent: string;
  integrations: { id: IntegrationId; account: string | null }[];
  projects: IAppProjectBrief[];
  workspaces: IAppWorkspaceBrief[];
}
