import type { IFrameSink } from './IFrameSink';
import type { IRunnerApi } from './IRunnerApi';
import type { RunnerJob } from './RunnerJob';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { ICaseAgent } from '@/engine/walk/types';
import type { Harness } from '@/Harness.class';

/** What a CI run's machine walks its job with: the API, the harness, the folder it works in, the device and the agent the job calls for, what records a browser when the machine can, and the clock. */
export interface IJobRunner {
  api: IRunnerApi;
  harness: Harness;
  workDir: string;
  deviceFor: (props: {
    job: RunnerJob;
    build: string | null;
    workDir: string;
  }) => Promise<IDeviceDriver>;
  agentFor: (job: RunnerJob) => ICaseAgent | null;
  frames: IFrameSink | null;
  heartbeatMs?: number;
  now?: () => number;
}
