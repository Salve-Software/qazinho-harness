/**
 * O que um build acha nesta máquina: o SDK do Android, o JDK que recebeu, e se o Xcode
 * está lá.
 */
export interface IBuildMachine {
  androidSdk: string | null;
  javaHome: string | null;
  hasXcode: boolean;
}
