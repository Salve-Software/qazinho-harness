export const FILE_VIEWER_SCRIPT = `
const INFO = await (await fetch('/~/info')).json();
const main = document.querySelector('main');
const fileBytes = async () => (await fetch('/~/file')).arrayBuffer();
const px = (value) => value + 'px';

document.title = INFO.name;

function sectionOf(label) {
  const section = document.createElement('section');

  if (label !== null) {
    const header = document.createElement('header');

    header.textContent = label;
    section.append(header);
  }

  main.append(section);

  return section;
}

function noteOf(text) {
  const note = document.createElement('p');

  note.className = 'note';
  note.textContent = text;
  main.append(note);
}

function linesOf(props) {
  const parts = props.items
    .filter((item) => typeof item.str === 'string' && item.str.trim() !== '')
    .map((item) => {
      const [, , c, d, x, y] = props.transform(props.viewport.transform, item.transform);

      return { text: item.str, x, y, height: Math.hypot(c, d), width: item.width * props.viewport.scale };
    })
    .sort((one, other) => one.y - other.y);
  const lines = [];

  for (const part of parts) {
    const line = lines.at(-1);

    if (line !== undefined && part.y - line.y < Math.max(line.height, part.height) * 0.5) line.parts.push(part);
    else lines.push({ y: part.y, height: part.height, parts: [part] });
  }

  return lines.map(({ y, height, parts: row }) => {
    const sorted = [...row].sort((one, other) => one.x - other.x);
    let text = '';
    let end = null;

    for (const part of sorted) {
      const isApart = end !== null && part.x - end > part.height * 0.15;

      if (isApart && !text.endsWith(' ') && !part.text.startsWith(' ')) text += ' ';

      text += part.text;
      end = part.x + part.width;
    }

    return { text: text.trim(), x: sorted[0].x, y, height };
  });
}

async function showPdf() {
  const pdfjs = await import('/~/pdf.js');
  const worker = await (await fetch('/~/pdf.worker.js')).text();

  pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([worker], { type: 'text/javascript' }));

  const file = await pdfjs.getDocument({ data: await fileBytes(), isEvalSupported: false }).promise;
  const shown = Math.min(file.numPages, INFO.pagesShown);
  const sheets = [];

  if (shown < file.numPages) noteOf('Showing the first ' + shown + ' of ' + file.numPages + ' pages.');

  for (let number = 1; number <= shown; number += 1) {
    const page = await file.getPage(number);
    const natural = page.getViewport({ scale: 1 });
    const scale = Math.min((window.innerWidth - INFO.marginPx) / natural.width, INFO.maxScale);
    const viewport = page.getViewport({ scale });
    const section = sectionOf(number + ' / ' + file.numPages);
    const sheet = document.createElement('div');
    const image = new Image();
    const layer = document.createElement('div');
    const { items } = await page.getTextContent();

    sheet.className = 'sheet';
    sheet.style.width = px(viewport.width);
    sheet.style.height = px(viewport.height);
    image.alt = '';
    layer.className = 'text';

    for (const line of linesOf({ items, viewport, transform: pdfjs.Util.transform })) {
      const span = document.createElement('span');

      span.textContent = line.text;
      span.style.left = px(line.x);
      span.style.top = px(line.y - line.height);
      span.style.fontSize = px(line.height);
      layer.append(span);
    }

    sheet.append(image, layer);
    section.append(sheet);
    sheets.push({ page, image, scale });
  }

  const ratio = Math.min(window.devicePixelRatio, 2);

  for (const { page, image, scale } of sheets) {
    const output = page.getViewport({ scale: scale * ratio });
    const canvas = document.createElement('canvas');

    canvas.width = Math.floor(output.width);
    canvas.height = Math.floor(output.height);
    await page.render({ canvas, viewport: output }).promise;

    const blob = await new Promise((done) => {
      canvas.toBlob(done);
    });

    image.src = URL.createObjectURL(blob);
    await image.decode();
    canvas.width = 0;
    page.cleanup();
  }
}

async function showImage() {
  const image = new Image();

  image.className = 'picture';
  image.alt = '';
  image.src = '/~/file';
  sectionOf(null).append(image);
  await image.decode();
}

function textOf(bytes) {
  const head = new Uint8Array(bytes.slice(0, 2));
  const isWide = head[0] === 0xff && head[1] === 0xfe;
  const read = new TextDecoder(isWide ? 'utf-16le' : 'utf-8').decode(bytes);

  return read.includes('\\ufffd') ? new TextDecoder('windows-1252').decode(bytes) : read;
}

async function showText() {
  const bytes = await fileBytes();
  const lines = textOf(bytes.slice(0, INFO.textBytesShown)).split(/\\r?\\n/);

  main.classList.add('is-text');

  if (bytes.byteLength > INFO.textBytesShown) noteOf('Showing the start of a long file.');

  for (let start = 0; start < lines.length; start += INFO.linesPerBlock) {
    const block = document.createElement('pre');

    block.textContent = lines.slice(start, start + INFO.linesPerBlock).join('\\n');
    sectionOf(null).append(block);
  }
}

const SHOWS = { pdf: showPdf, image: showImage, text: showText };

try {
  await SHOWS[INFO.kind]();
  window.__qazinhoFile = null;
} catch (reason) {
  window.__qazinhoFile =
    reason?.name === 'PasswordException'
      ? 'it asks for a password'
      : 'it is damaged or in a form QAzinho cannot read';
}
`;
