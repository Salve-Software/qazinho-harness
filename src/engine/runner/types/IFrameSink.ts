import type { IRunVideo } from '@/contract';

/** What records a browser's live frames into a video: started on a file, handed each frame, and stopped with what it made. */
export interface IFrameSink {
  start: (file: string) => void;
  push: (jpeg: Buffer) => void;
  stop: () => Promise<IRunVideo | null>;
}
