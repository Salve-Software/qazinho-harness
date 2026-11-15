/**
 * As flags do emulador numa run: o AVD do QA sem animação de boot nem som, e sem janela
 * própria, menos quando o QA anda o caso nela.
 */
export function bootArgs(props: { avd: string; isWindowed: boolean }): string[] {
  return [
    '-avd',
    props.avd,
    ...(props.isWindowed ? [] : ['-no-window']),
    '-no-boot-anim',
    '-no-audio',
  ];
}
