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
          | 'explore_app';
      }
    >
  | (Extract<
      AppToolCall,
      {
        name:
          | 'update_project'
          | 'rename_workspace'
          | 'delete_workspace'
          | 'delete_project'
          | 'dismiss_bug'
          | 'send_bug';
      }
    > & { args: { confirm?: string } })
  | { name: 'list_workspaces'; args: Record<string, never> }
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
  | {
      name: 'update_cases';
      args: { workspace: string; cases: IDraftedCase[]; confirm?: string };
    }
  | {
      name: 'delete_cases';
      args: { workspace: string; cases: string[]; confirm?: string };
    }
  | {
      name: 'ask_workspace_chat';
      args: { workspace: string; text: string; waitSeconds?: number };
    }
  | { name: 'read_workspace_chat'; args: { workspace: string; waitSeconds?: number } }
  | {
      name: 'suggest_cases';
      args: { workspace: string; summary: string; cases: IDraftedCase[] };
    };
