import type { IExploredScreen } from './IExploredScreen';
import type { IExploreFinish } from './IExploreFinish';
import type { IQaQuestion } from './IQaQuestion';
import type { IStepFinding } from './IStepFinding';
import type { IStepReport } from './IStepReport';
import type { IStepAction } from '@/contract';

/**
 * A tool call read against its schema: what to do with it, or what to say back to the
 * agent.
 */
export type DeviceToolCall =
  | { kind: 'look' }
  | { kind: 'inspect'; target: string }
  | { kind: 'network'; ask: { id?: number; filter?: string } }
  | { kind: 'act'; action: IStepAction }
  | { kind: 'report'; report: IStepReport }
  | { kind: 'finding'; finding: IStepFinding }
  | { kind: 'ask'; question: IQaQuestion }
  | { kind: 'screen'; screen: IExploredScreen }
  | { kind: 'finish'; finish: IExploreFinish }
  | { kind: 'refused'; error: string };
