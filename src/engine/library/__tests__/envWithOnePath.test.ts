import { describe, expect, it } from 'vitest';
import { envWithOnePath } from '@/engine/library';

describe('envWithOnePath', () => {
  it("keeps the PATH QAzinho set over Windows' own Path", () => {
    expect(
      envWithOnePath({
        env: { Path: 'C:\\Windows', PATH: 'C:\\tools;C:\\Windows', HOME: 'x' },
        platform: 'win32',
      }),
    ).toEqual({ PATH: 'C:\\tools;C:\\Windows', HOME: 'x' });
  });

  it('leaves an environment with one PATH as it is', () => {
    const env = { Path: 'C:\\Windows' };

    expect(envWithOnePath({ env, platform: 'win32' })).toBe(env);
  });

  it('does NOT touch it on a Mac or Linux, where the case is part of the name', () => {
    const env = { Path: '/a', PATH: '/b' };

    expect(envWithOnePath({ env, platform: 'linux' })).toBe(env);
  });
});
