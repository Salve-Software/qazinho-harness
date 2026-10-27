import type { IHarnessSection } from '@/context/types';
import type { IBuildMachine } from '@/types';

/**
 * The build to make and the machine it is made on, as the sections the builder reads
 * before it starts.
 */
export function describeBuild(props: {
  platform: 'android' | 'ios';
  dir: string;
  repository: string;
  branch: string;
  commit: string;
  machine: IBuildMachine;
}): IHarnessSection[] {
  const { machine } = props;

  return [
    {
      title: 'The build',
      lines: [
        `Build ${props.platform === 'android' ? 'an Android .apk' : 'an iOS .app for the simulator'} of ${props.repository}, branch ${props.branch} (commit ${props.commit.slice(0, 7)}).`,
        `The copy of the code is in ${props.dir}: work inside it, and leave the build there.`,
      ],
    },
    {
      title: 'This machine',
      lines: [
        machine.androidSdk === null
          ? 'QAzinho found no Android SDK on this machine.'
          : `The Android SDK is at ${machine.androidSdk}; ANDROID_HOME points at it.`,
        machine.javaHome === null
          ? 'QAzinho found no JDK of its own: use the one on the PATH.'
          : `The JDK is at ${machine.javaHome}; JAVA_HOME points at it.`,
        machine.hasXcode ? 'Xcode is installed.' : 'Xcode is not installed.',
      ],
    },
  ];
}
