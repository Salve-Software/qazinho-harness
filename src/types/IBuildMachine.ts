/** What a build finds on this machine: the Android SDK, the JDK it was handed, and whether Xcode is there. */
export interface IBuildMachine {
  androidSdk: string | null;
  javaHome: string | null;
  hasXcode: boolean;
}
