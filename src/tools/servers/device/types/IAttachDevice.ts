import type { DevicePurpose } from './DevicePurpose';
import type { IDevicePort } from './IDevicePort';
import type { IExploredScreen } from './IExploredScreen';
import type { IExploreFinish } from './IExploreFinish';
import type { IQaQuestion } from './IQaQuestion';
import type { IStepFinding } from './IStepFinding';
import type { IStepReport } from './IStepReport';

/**
 * O dispositivo de um workspace durante uma run ou exploração, até quando pode agir, e
 * quem ouve o que o agente relata, anota, abre e pergunta ao QA.
 */
export interface IAttachDevice {
  workspaceId: string;
  driver: IDevicePort;
  purpose?: DevicePurpose;
  endsAt?: number;
  onReport?: (report: IStepReport) => Promise<string>;
  onFinding?: (finding: IStepFinding) => Promise<string>;
  onScreen?: (screen: IExploredScreen) => Promise<string>;
  onFinish?: (finish: IExploreFinish) => Promise<string>;
  onAsk?: (question: IQaQuestion) => Promise<string>;
}
