import type { IAppProjectBrief } from './IAppProjectBrief';
import type { IAppWorkspaceBrief } from './IAppWorkspaceBrief';
import type { IntegrationId } from './IntegrationId';
import type { Language } from './Language';

/** QAzinho as the assistant reads it with a message: what is on screen, how the QA set it up, and every project and workspace. */
export interface IAppSnapshot {
  screen: 'home' | 'workspace' | 'settings';
  openWorkspaceId: string | null;
  openTab: 'plan' | 'device' | 'runs' | 'bugs' | null;
  openRunId: string | null;
  openBugId: string | null;
  language: Language;
  theme: 'night' | 'paper';
  runAlert: 'system' | 'app';
  agent: string;
  integrations: { id: IntegrationId; account: string | null }[];
  projects: IAppProjectBrief[];
  workspaces: IAppWorkspaceBrief[];
}
