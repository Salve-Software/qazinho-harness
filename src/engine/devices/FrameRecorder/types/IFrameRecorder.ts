/** Onde está o ffmpeg da máquina, e quantos frames por segundo o vídeo guarda. */
export interface IFrameRecorder {
  ffmpeg: string;
  fps?: number;
}
