import { describe, expect, it } from 'vitest';
import { readBuildAnswer } from '@/library';

describe('readBuildAnswer', () => {
  it('reads where the build is and what was built, trimmed', () => {
    expect(
      readBuildAnswer(
        '{"artifact":" /b/src/android/app/build/outputs/apk/release/app-release.apk ","summary":"Built the release APK.","failure":""}',
      ),
    ).toEqual({
      artifact: '/b/src/android/app/build/outputs/apk/release/app-release.apk',
      summary: 'Built the release APK.',
      failure: '',
    });
  });

  it('takes prose, or JSON in another shape, as the reason there is no build', () => {
    expect(readBuildAnswer('Java 17 is missing.')).toEqual({
      artifact: '',
      summary: '',
      failure: 'Java 17 is missing.',
    });
    expect(readBuildAnswer('{"path":"/x.apk"}')).toEqual({
      artifact: '',
      summary: '',
      failure: '{"path":"/x.apk"}',
    });
  });
});
