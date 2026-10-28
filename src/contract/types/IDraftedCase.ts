/**
 * Um caso que o agente rascunhou: `id` nomeia o caso que ele muda, nenhum para um novo; o
 * `frame` de um passo é o nó dele no Figma.
 */
export interface IDraftedCase {
  id?: string | undefined;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string; frame?: string | undefined }[];
}
