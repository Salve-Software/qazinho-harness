/**
 * Um caso que o agente rascunhou: o caso que ele muda, de onde vem o esperado, as dúvidas
 * que o seguram, e o nó do Figma de cada passo.
 */
export interface IDraftedCase {
  id?: string | undefined;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string; frame?: string | undefined }[];
  sources?: string[] | undefined;
  blockedBy?: string[] | undefined;
}
