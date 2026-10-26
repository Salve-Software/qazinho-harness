import type { IDeviceDriver } from '@/engine/devices/types';
import type { IRunnerEnv, RunnerJob } from '@/engine/runner/types';
import type { ICaseAgent } from '@/engine/walk/types';
import { delimiter, join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCodeAgent, GatewayAgent, modelClientOf } from '@/engine/agents';
import { AndroidDriver, FrameRecorder, IosDriver, WebDriver } from '@/engine/devices';
import { listAvds } from '@/engine/devices/AndroidDriver/library';
import { listSimulators } from '@/engine/devices/IosDriver/library';
import { findOnPath } from '@/engine/library';
import { JobRunner, RUNNER, RunnerApi } from '@/engine/runner';
import { appOfZip, runnerEnvOf } from '@/engine/runner/library';
import { Harness } from '@/Harness.class';
import { McpHost } from '@/tools/McpHost.class';

const say = (line: string) => {
  process.stdout.write(`${new Date().toISOString()} ${line}\n`);
};

const onPath = (command: string) =>
  findOnPath({ command, directories: (process.env.PATH ?? '').split(delimiter) });

async function deviceFor(props: {
  env: IRunnerEnv;
  job: RunnerJob;
  build: string | null;
  workDir: string;
}): Promise<IDeviceDriver> {
  const { env, job, build, workDir } = props;

  if (job.target.kind === 'web')
    return new WebDriver({
      url: job.target.value,
      profileDir: join(workDir, RUNNER.profile),
    });

  if (build === null)
    throw new Error(`This ${job.target.kind} job names no build to install.`);

  if (job.target.kind === 'android') {
    if (env.androidSdk === null)
      throw new Error('This machine has no Android SDK: ANDROID_HOME is not set.');

    const avd = env.avd ?? (await listAvds(env.androidSdk))[0];

    if (avd === undefined)
      throw new Error('This machine has no Android emulator to walk on.');

    return new AndroidDriver({ sdkRoot: env.androidSdk, avd, apk: build });
  }

  const idb = env.idb ?? onPath('idb');
  const udid = env.simulator ?? (await listSimulators()).at(-1);
  const app = await appOfZip({ zip: build, folder: join(workDir, 'app') });

  if (idb === null)
    throw new Error('This machine has no idb to touch the simulator with.');

  if (udid === undefined)
    throw new Error('This machine has no iOS simulator to walk on.');

  if (app === null) throw new Error('The build holds no simulator app.');

  return new IosDriver({ idb, udid, app });
}

function agentFor(props: {
  job: RunnerJob;
  tools: McpHost;
  workDir: string;
}): ICaseAgent | null {
  const { job } = props;

  if (job.agent === 'gateway' && job.model !== null)
    return new GatewayAgent({ client: modelClientOf(new Anthropic()), model: job.model });

  const claude = job.agent === 'claude-code' ? onPath('claude') : null;

  return claude === null
    ? null
    : new ClaudeCodeAgent({
        command: claude,
        model: job.model,
        tools: props.tools,
        folder: join(props.workDir, 'agent'),
      });
}

async function main(): Promise<number> {
  const env = runnerEnvOf(process.env);

  if (typeof env === 'string') {
    say(env);

    return 1;
  }

  const ffmpeg = onPath('ffmpeg');
  const tools = new McpHost();
  const runner = new JobRunner({
    api: new RunnerApi({ url: env.apiUrl, token: env.token }),
    harness: new Harness(),
    workDir: env.workDir,
    deviceFor: (props) => deviceFor({ ...props, env }),
    agentFor: (job) => agentFor({ job, tools, workDir: env.workDir }),
    frames: ffmpeg === null ? null : new FrameRecorder({ ffmpeg }),
  });

  say(
    `Walking job ${env.jobId}${ffmpeg === null ? ', with no ffmpeg to record a browser' : ''}.`,
  );

  try {
    await runner.run();
    say(`Job ${env.jobId} walked.`);

    return 0;
  } catch (reason) {
    say(
      `Job ${env.jobId} could not start: ${reason instanceof Error ? reason.message : String(reason)}`,
    );

    return 1;
  } finally {
    tools.close();
  }
}

process.exitCode = await main();
