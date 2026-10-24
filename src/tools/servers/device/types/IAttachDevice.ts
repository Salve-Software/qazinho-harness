import type { DevicePurpose } from './DevicePurpose';
import type { IDevicePort } from './IDevicePort';
import type { IExploredScreen } from './IExploredScreen';
import type { IExploreFinish } from './IExploreFinish';
import type { IQaQuestion } from './IQaQuestion';
import type { IStepFinding } from './IStepFinding';
import type { IStepReport } from './IStepReport';

/** A workspace's device for the length of a run or an exploration, until when it may act, and who hears what its agent reports, notes, files and asks the QA. */
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
