/**
 * Como um job grava o dispositivo: os frames de um navegador pelo ffmpeg da máquina num
 * arquivo, um celular numa pasta própria, ou nada.
 */
export type Recording =
  | { kind: 'frames'; file: string }
  | { kind: 'device'; folder: string }
  | { kind: 'none' };
