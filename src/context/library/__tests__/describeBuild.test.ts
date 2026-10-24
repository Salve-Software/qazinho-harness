import { describe, expect, it } from 'vitest';
import { describeBuild } from '@/context/library';

const BUILD = {
  dir: '/data/builds/work/b-1/src',
  repository: 'acme/loja-app',
  branch: 'feat/cupom',
  commit: 'c0ffee1234567890',
};

describe('describeBuild', () => {
  it('names the build, the copy it starts from, and what the machine has', () => {
    expect(
      describeBuild({
        ...BUILD,
        platform: 'ios',
        machine: { androidSdk: '/sdk', javaHome: '/jdk', hasXcode: true },
      }),
    ).toEqual([
      {
        title: 'The build',
        lines: [
          'Build an iOS .app for the simulator of acme/loja-app, branch feat/cupom (commit c0ffee1).',
          'The copy of the code is in /data/builds/work/b-1/src: work inside it, and leave the build there.',
        ],
      },
      {
        title: 'This machine',
        lines: [
          'The Android SDK is at /sdk; ANDROID_HOME points at it.',
          'The JDK is at /jdk; JAVA_HOME points at it.',
          'Xcode is installed.',
        ],
      },
    ]);
  });

  it('says what the machine lacks, so the builder stops early with the reason', () => {
    expect(
      describeBuild({
        ...BUILD,
        platform: 'android',
        machine: { androidSdk: null, javaHome: null, hasXcode: false },
      })[1]?.lines,
    ).toEqual([
      'QAzinho found no Android SDK on this machine.',
      'QAzinho found no JDK of its own: use the one on the PATH.',
      'Xcode is not installed.',
    ]);
  });
});
