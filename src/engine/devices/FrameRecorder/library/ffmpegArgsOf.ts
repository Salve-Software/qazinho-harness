/**
 * The flags that make ffmpeg read JPEG frames from its input at a steady rate and write
 * an H.264 MP4 a browser plays from its first byte, its sides made even.
 */
export function ffmpegArgsOf(props: {
  file: string;
  fps: number;
  crf: number;
}): string[] {
  return [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-f',
    'image2pipe',
    '-framerate',
    String(props.fps),
    '-c:v',
    'mjpeg',
    '-i',
    '-',
    '-vf',
    'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    String(props.crf),
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    props.file,
  ];
}
