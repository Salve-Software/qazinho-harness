/** The emulator's flags for a run: the QA's AVD with no window of its own, since QAzinho shows its screen in the device panel, and no boot animation or sound. */
export function bootArgs(avd: string): string[] {
  return ['-avd', avd, '-no-window', '-no-boot-anim', '-no-audio'];
}
