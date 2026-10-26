interface IBox {
  kind: string;
  body: Buffer;
}

function boxesIn(bytes: Buffer): IBox[] {
  const found: IBox[] = [];
  let at = 0;

  while (at + 8 <= bytes.length) {
    let size = bytes.readUInt32BE(at);
    let head = 8;

    if (size === 1 && at + 16 <= bytes.length) {
      size = Number(bytes.readBigUInt64BE(at + 8));
      head = 16;
    } else if (size === 0) size = bytes.length - at;

    if (size < head || at + size > bytes.length) break;

    found.push({
      kind: bytes.toString('latin1', at + 4, at + 8),
      body: bytes.subarray(at + head, at + size),
    });
    at += size;
  }

  return found;
}

function inside(box: IBox | undefined, kind: string): IBox | undefined {
  return box === undefined
    ? undefined
    : boxesIn(box.body).find((one) => one.kind === kind);
}

/** How long an MP4's video plays and how large it is, read from its video track, the way a <video> reads it; null when it has none. */
export function mp4FactsOf(
  bytes: Buffer | null,
): { durationMs: number; width: number; height: number } | null {
  if (bytes === null) return null;

  const moov = boxesIn(bytes).find(({ kind }) => kind === 'moov');
  const tracks =
    moov === undefined ? [] : boxesIn(moov.body).filter(({ kind }) => kind === 'trak');

  for (const track of tracks) {
    const mdia = inside(track, 'mdia');
    const hdlr = inside(mdia, 'hdlr');
    const mdhd = inside(mdia, 'mdhd');
    const tkhd = inside(track, 'tkhd');

    if (hdlr?.body.toString('latin1', 8, 12) !== 'vide' || !mdhd || !tkhd) continue;

    const isLong = mdhd.body[0] === 1;
    const timescale = mdhd.body.readUInt32BE(isLong ? 20 : 12);
    const duration = isLong
      ? Number(mdhd.body.readBigUInt64BE(24))
      : mdhd.body.readUInt32BE(16);
    const sizeAt = tkhd.body[0] === 1 ? 88 : 76;

    if (timescale === 0 || tkhd.body.length < sizeAt + 8) return null;

    return {
      durationMs: Math.round((duration / timescale) * 1000),
      width: Math.round(tkhd.body.readUInt32BE(sizeAt) / 65_536),
      height: Math.round(tkhd.body.readUInt32BE(sizeAt + 4) / 65_536),
    };
  }

  return null;
}
