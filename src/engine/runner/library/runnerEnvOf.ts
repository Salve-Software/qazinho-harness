import type { IRunnerEnv } from '@/engine/runner/types';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * O ambiente da máquina como um runner o lê; as palavras que dizem o que falta quando ele
 * não consegue andar um job.
 */
export function runnerEnvOf(env: NodeJS.ProcessEnv): IRunnerEnv | string {
  const apiUrl = filled(env.QAZINHO_API_URL);
  const token = filled(env.QAZINHO_JOB_TOKEN);

  if (apiUrl === null || token === null)
    return 'This machine was started with no QAZINHO_API_URL or QAZINHO_JOB_TOKEN: it has no job to walk.';

  const jobId = filled(env.QAZINHO_JOB_ID) ?? 'job';

  return {
    apiUrl,
    jobId,
    token,
    workDir: filled(env.QAZINHO_WORK_DIR) ?? join(tmpdir(), `qazinho-${jobId}`),
    androidSdk: filled(env.ANDROID_HOME) ?? filled(env.ANDROID_SDK_ROOT),
    avd: filled(env.QAZINHO_AVD),
    simulator: filled(env.QAZINHO_SIMULATOR),
    axe: filled(env.QAZINHO_AXE),
  };
}

const filled = (value: string | undefined) =>
  value === undefined || value.trim().length === 0 ? null : value.trim();
