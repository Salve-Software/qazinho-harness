/** Where the machine's ffmpeg is, and how many frames a second the video keeps. */
export interface IFrameRecorder {
  ffmpeg: string;
  fps?: number;
}
