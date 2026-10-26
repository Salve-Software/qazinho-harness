import type { IBugBody } from './IBugBody';
import type { IEvidenceGrant } from './IEvidenceGrant';
import type { IRunBody } from './IRunBody';
import type { ISightingBody } from './ISightingBody';
import type { RunnerJob } from './RunnerJob';
import type { ICaseRecipe } from '@/contract';

/** QAzinho's API as a CI run's machine calls it, with its job's token. */
export interface IRunnerApi {
  job: () => Promise<RunnerJob>;
  build: (file: string) => Promise<void>;
  progress: (progress: {
    phase: string;
    done: number;
    total: number;
    message: string | null;
  }) => Promise<void>;
  evidence: (file: {
    kind: 'screenshot' | 'video' | 'network';
    contentType: string;
    size: number;
    sha256: string;
  }) => Promise<IEvidenceGrant>;
  upload: (props: { grant: IEvidenceGrant; file: string }) => Promise<void>;
  putRun: (props: { planId: string; runId: string; body: IRunBody }) => Promise<void>;
  putBug: (props: { planId: string; bugId: string; body: IBugBody }) => Promise<void>;
  addSighting: (props: {
    planId: string;
    bugId: string;
    sighting: ISightingBody;
  }) => Promise<void>;
  putRecordings: (props: { planId: string; recordings: ICaseRecipe[] }) => Promise<void>;
  complete: (ending: {
    ending: 'finished' | 'broke';
    reason: string | null;
  }) => Promise<void>;
}
