/**
 * As flags do emulador numa run: o AVD do QA sem janela própria, já que o QAzinho mostra
 * a tela no painel do dispositivo, e sem animação de boot nem som.
 */
export function bootArgs(avd: string): string[] {
  return ['-avd', avd, '-no-window', '-no-boot-anim', '-no-audio'];
}
