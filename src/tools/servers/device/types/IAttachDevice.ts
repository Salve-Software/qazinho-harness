import type { DevicePurpose } from './DevicePurpose';
import type { IDevicePort } from './IDevicePort';
import type { IExploredScreen } from './IExploredScreen';
import type { IExploreFinish } from './IExploreFinish';
import type { IQaQuestion } from './IQaQuestion';
import type { ISaid } from './ISaid';
import type { IStepFinding } from './IStepFinding';
import type { IStepReport } from './IStepReport';

/**
 * O dispositivo de um workspace durante uma run ou exploração, quem ouve o que o agente
 * relata, abre e diz ao QA, e o que a run tem a dizer a ele junto de cada resposta.
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
  onSay?: (said: ISaid) => Promise<string>;
  onAnswer?: (text: string) => Promise<string>;
  aside?: () => string | null;
}
