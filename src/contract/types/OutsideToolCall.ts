import type { AppToolCall } from './AppToolCall';
import type { IDraftedCase } from './IDraftedCase';

/**
 * Uma ferramenta como um agente de fora a chamou, lida contra o schema: as que ele divide
 * com o assistente, e as que só ele recebe.
 */
export type OutsideToolCall =
  | Extract<
      AppToolCall,
      {
        name:
          | 'workspace_details'
          | 'bug_details'
          | 'stop_run'
          | 'create_workspace'
          | 'update_project'
          | 'rename_workspace'
          | 'delete_workspace'
          | 'delete_project'
          | 'explore_app'
          | 'dismiss_bug'
          | 'send_bug'
          | 'ask_variables'
          | 'update_variable'
          | 'delete_variable'
          | 'change_settings'
          | 'connect_integration'
          | 'disconnect_integration'
          | 'list_repositories'
          | 'link_repository'
          | 'unlink_repository'
          | 'link_design'
          | 'unlink_design'
          | 'build_app'
          | 'build_status';
      }
    >
  | { name: 'list_workspaces'; args: Record<string, never> }
  | { name: 'list_variables'; args: { project: string } }
  | { name: 'read_settings'; args: Record<string, never> }
  | {
      name: 'create_project';
      args: { name: string; web?: string; android?: string; ios?: string };
    }
  | {
      name: 'start_run';
      args: { workspace: string; cases?: string[]; withAgent?: boolean };
    }
  | {
      name: 'run_status';
      args: { workspace: string; run?: string; waitSeconds?: number };
    }
  | { name: 'add_cases'; args: { workspace: string; cases: IDraftedCase[] } }
  | { name: 'update_cases'; args: { workspace: string; cases: IDraftedCase[] } }
  | { name: 'delete_cases'; args: { workspace: string; cases: string[] } }
  | {
      name: 'ask_workspace_chat';
      args: { workspace: string; text: string; waitSeconds?: number };
    }
  | { name: 'read_workspace_chat'; args: { workspace: string; waitSeconds?: number } }
  | { name: 'pause_run'; args: { workspace: string } }
  | { name: 'resume_run'; args: { workspace: string } }
  | { name: 'answer_run_question'; args: { workspace: string; answer: string } }
  | { name: 'take_suggestion'; args: { workspace: string; cases?: number[] } };
