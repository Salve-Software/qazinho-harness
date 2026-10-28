/**
 * As flags que fazem o ffmpeg ler frames JPEG da entrada num ritmo constante e escrever
 * um MP4 H.264 que um navegador toca desde o primeiro byte, com os lados pares.
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
