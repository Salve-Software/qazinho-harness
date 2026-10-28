/**
 * Onde um momento, em ms de epoch, fica num vídeo que começou em `startedAt`: em segundos
 * até o centésimo, nunca antes de o vídeo começar.
 */
export function videoSecondsOf(props: { at: number; startedAt: number }): number {
  return Math.max(0, Math.round((props.at - props.startedAt) / 10) / 100);
}
