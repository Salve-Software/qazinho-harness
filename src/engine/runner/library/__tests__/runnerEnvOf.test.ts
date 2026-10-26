import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runnerEnvOf } from '@/engine/runner/library';

describe('runnerEnvOf', () => {
  it('reads the job, the API and the device tools the machine was started with', () => {
    expect(
      runnerEnvOf({
        QAZINHO_API_URL: 'https://api.qazinho.test',
        QAZINHO_JOB_TOKEN: 'qzj_token',
        QAZINHO_JOB_ID: 'j1',
        QAZINHO_WORK_DIR: '/work',
        ANDROID_SDK_ROOT: '/opt/android',
        QAZINHO_AVD: 'Pixel_9',
      }),
    ).toEqual({
      apiUrl: 'https://api.qazinho.test',
      jobId: 'j1',
      token: 'qzj_token',
      workDir: '/work',
      androidSdk: '/opt/android',
      avd: 'Pixel_9',
      simulator: null,
      idb: null,
    });
  });

  it('works in a folder of the job’s own when the machine names none', () => {
    expect(
      runnerEnvOf({
        QAZINHO_API_URL: 'https://api.qazinho.test',
        QAZINHO_JOB_TOKEN: 'qzj',
        QAZINHO_JOB_ID: 'j9',
      }),
    ).toMatchObject({ workDir: join(tmpdir(), 'qazinho-j9'), androidSdk: null });
  });

  it('says what is missing when the machine has no job to walk', () => {
    expect(
      runnerEnvOf({
        QAZINHO_API_URL: 'https://api.qazinho.test',
        QAZINHO_JOB_TOKEN: ' ',
      }),
    ).toMatch(/no QAZINHO_API_URL or QAZINHO_JOB_TOKEN/);
  });
});
