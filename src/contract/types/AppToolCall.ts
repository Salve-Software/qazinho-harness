import type { BuildPlatform } from './BuildPlatform';
import type { IntegrationId } from './IntegrationId';
import type { IssueTracker } from './IssueTracker';
import type { Language } from './Language';
import type { TargetKind } from './TargetKind';

/** One of QAzinho's app tools as the assistant called it, read against its schema: what the page carries out. */
export type AppToolCall =
  | { name: 'workspace_details'; args: { workspace: string } }
  | { name: 'run_details'; args: { workspace: string; run?: string } }
  | { name: 'bug_details'; args: { workspace: string; bug: string } }
  | { name: 'list_repositories'; args: Record<string, never> }
  | {
      name: 'open_workspace';
      args: {
        workspace: string;
        tab?: 'chat' | 'plan' | 'runs' | 'bugs';
        run?: string;
        bug?: string;
      };
    }
  | { name: 'open_project'; args: { project: string } }
  | {
      name: 'open_settings';
      args: {
        section?:
          | 'agents'
          | 'devices'
          | 'integrations'
          | 'mcps'
          | 'appearance'
          | 'shortcuts'
          | 'about';
      };
    }
  | { name: 'go_home'; args: Record<string, never> }
  | {
      name: 'create_project';
      args: {
        name: string;
        web?: string;
        android?: string;
        ios?: string;
        repositories?: string[];
      };
    }
  | {
      name: 'update_project';
      args: {
        project: string;
        name?: string;
        web?: string;
        android?: string;
        ios?: string;
      };
    }
  | {
      name: 'link_repository';
      args: { project: string; repository: string; base?: string };
    }
  | { name: 'unlink_repository'; args: { project: string; repository: string } }
  | {
      name: 'create_workspace';
      args: { project: string; name: string; target?: TargetKind };
    }
  | { name: 'rename_workspace'; args: { workspace: string; name: string } }
  | { name: 'link_design'; args: { workspace: string; link: string } }
  | { name: 'unlink_design'; args: { workspace: string } }
  | { name: 'run_plan'; args: { workspace: string } }
  | { name: 'explore_app'; args: { workspace: string } }
  | {
      name: 'ask_variables';
      args: { project: string; variables: { name: string; description: string }[] };
    }
  | {
      name: 'update_variable';
      args: { project: string; variable: string; name?: string; description?: string };
    }
  | { name: 'delete_variable'; args: { project: string; variable: string } }
  | { name: 'stop_run'; args: { workspace: string } }
  | {
      name: 'send_bug';
      args: {
        workspace: string;
        bug: string;
        tracker?: IssueTracker;
        project?: string;
        repository?: string;
      };
    }
  | { name: 'dismiss_bug'; args: { workspace: string; bug: string; reopen?: boolean } }
  | {
      name: 'ask_workspace_chat';
      args: {
        workspace: string;
        text: string;
        story?: string;
        confluence?: string;
        figma?: string;
      };
    }
  | {
      name: 'change_settings';
      args: {
        theme?: 'night' | 'paper';
        language?: Language;
        runAlert?: 'system' | 'app';
      };
    }
  | { name: 'connect_integration'; args: { integration: IntegrationId } }
  | { name: 'disconnect_integration'; args: { integration: IntegrationId } }
  | {
      name: 'build_app';
      args: {
        project: string;
        platform: BuildPlatform;
        repository?: string;
        branch?: string;
      };
    }
  | { name: 'build_status'; args: { project?: string } }
  | { name: 'delete_workspace'; args: { workspace: string } }
  | { name: 'delete_project'; args: { project: string } };
