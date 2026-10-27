/**
 * How a job records its device: a browser's frames through the machine's ffmpeg into a
 * file, a phone into a folder of its own, or not at all.
 */
export type Recording =
  | { kind: 'frames'; file: string }
  | { kind: 'device'; folder: string }
  | { kind: 'none' };
