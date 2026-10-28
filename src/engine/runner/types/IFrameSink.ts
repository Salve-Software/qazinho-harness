import type { IRunVideo } from '@/contract';

/**
 * O que grava os frames ao vivo de um navegador num vídeo: iniciado num arquivo,
 * recebendo cada frame, e parado com o que fez.
 */
export interface IFrameSink {
  start: (file: string) => void;
  push: (jpeg: Buffer) => void;
  stop: () => Promise<IRunVideo | null>;
}
