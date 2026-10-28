import type { IFrameSink } from './IFrameSink';
import type { IRunnerApi } from './IRunnerApi';
import type { RunnerJob } from './RunnerJob';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { ICaseAgent } from '@/engine/walk/types';
import type { Harness } from '@/Harness.class';

/**
 * Com o que uma máquina do CI anda o job: a API, o harness, a pasta, o dispositivo, o
 * agente e o relógio.
 */
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
