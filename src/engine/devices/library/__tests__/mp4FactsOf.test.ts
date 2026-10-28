import { describe, expect, it } from 'vitest';
import { mp4FactsOf } from '@/engine/devices/library';

function box(kind: string, ...parts: Buffer[]): Buffer {
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(8);

  head.writeUInt32BE(body.length + 8, 0);
  head.write(kind, 4, 'latin1');

  return Buffer.concat([head, body]);
}

/** Um tkhd versão 0: o tamanho fica depois da matriz, em ponto fixo 16.16. */
function tkhd(width: number, height: number): Buffer {
  const body = Buffer.alloc(84);

  body.writeUInt32BE(width * 65_536, 76);
  body.writeUInt32BE(height * 65_536, 80);

  return box('tkhd', body);
}

function mdhd(timescale: number, duration: number): Buffer {
  const body = Buffer.alloc(24);

  body.writeUInt32BE(timescale, 12);
  body.writeUInt32BE(duration, 16);

  return box('mdhd', body);
}

function hdlr(handler: string): Buffer {
  const body = Buffer.alloc(24);

  body.write(handler, 8, 'latin1');

  return box('hdlr', body);
}

function movie(...tracks: Buffer[]): Buffer {
  const mvhd = Buffer.alloc(100);

  mvhd.writeUInt32BE(600, 12);
  mvhd.writeUInt32BE(6_874, 16);

  return Buffer.concat([
    box('ftyp', Buffer.from('isom')),
    box('moov', box('mvhd', mvhd), ...tracks),
  ]);
}

const video = (props: {
  width: number;
  height: number;
  timescale: number;
  duration: number;
}) =>
  box(
    'trak',
    tkhd(props.width, props.height),
    box('mdia', mdhd(props.timescale, props.duration), hdlr('vide')),
  );

describe('mp4FactsOf', () => {
  it('reads how long the video plays and its size from the video track', () => {
    expect(
      mp4FactsOf(
        movie(video({ width: 1206, height: 2622, timescale: 600, duration: 3_479 })),
      ),
    ).toEqual({ durationMs: 5_798, width: 1206, height: 2622 });
  });

  /**
   * O simctl escreve um cabeçalho de filme duas vezes mais longo do que o que toca; um
   * <video> segue a trilha.
   */
  it("goes by the video track's own length, not the movie header's", () => {
    expect(
      mp4FactsOf(
        movie(video({ width: 1280, height: 800, timescale: 1_000, duration: 3_687 })),
      )?.durationMs,
    ).toBe(3_687);
  });

  it('skips a track that is not video', () => {
    const sound = box(
      'trak',
      tkhd(0, 0),
      box('mdia', mdhd(44_100, 44_100), hdlr('soun')),
    );

    expect(
      mp4FactsOf(
        movie(sound, video({ width: 640, height: 480, timescale: 30, duration: 90 })),
      ),
    ).toEqual({ durationMs: 3_000, width: 640, height: 480 });
  });

  it('has nothing to say about a file that is not an MP4, or one that never came', () => {
    expect(mp4FactsOf(Buffer.from('not a movie at all'))).toBeNull();
    expect(mp4FactsOf(null)).toBeNull();
  });

  it('stops at a box that claims more bytes than the file has', () => {
    const broken = movie(video({ width: 640, height: 480, timescale: 30, duration: 90 }));

    expect(mp4FactsOf(broken.subarray(0, broken.length - 10))).toBeNull();
  });
});
