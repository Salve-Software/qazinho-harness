import type { FileKind } from '@/engine/devices/WebDriver/types';
import type { Page } from 'playwright-core';
import {
  FILE_VIEWER,
  FILE_VIEWER_PAGE,
  FILE_VIEWER_SCRIPT,
  PDF_ENGINE,
  WEB_DRIVER,
} from '@/engine/devices/WebDriver/constants';

const SCRIPT = 'text/javascript';
const BINARY = 'application/octet-stream';
const SVG = 'image/svg+xml';

/**
 * Mostra um arquivo baixado numa aba, servido só para ela, com o texto dele legível como
 * o de uma página; o que não abre diz por quê.
 */
export async function showFile(props: {
  page: Page;
  file: { name: string; kind: FileKind; bytes: Buffer };
}): Promise<void> {
  const { page, file } = props;
  const assets: Record<string, { body: string | Buffer; contentType: string }> = {
    '/viewer.js': { body: FILE_VIEWER_SCRIPT, contentType: SCRIPT },
    '/pdf.js': { body: PDF_ENGINE.engine, contentType: SCRIPT },
    '/pdf.worker.js': { body: PDF_ENGINE.worker, contentType: SCRIPT },
    '/file': {
      body: file.bytes,
      contentType: /\.svg$/i.test(file.name) ? SVG : BINARY,
    },
    '/info': {
      body: JSON.stringify({
        name: file.name,
        kind: file.kind,
        pagesShown: FILE_VIEWER.pagesShown,
        linesPerBlock: FILE_VIEWER.linesPerBlock,
        textBytesShown: FILE_VIEWER.textBytesShown,
        marginPx: FILE_VIEWER.marginPx,
        maxScale: FILE_VIEWER.maxScale,
      }),
      contentType: 'application/json',
    },
  };

  await page.route(`${FILE_VIEWER.origin}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const asset = pathname.startsWith(`${FILE_VIEWER.assets}/`)
      ? assets[pathname.slice(FILE_VIEWER.assets.length)]
      : undefined;

    return route.fulfill(asset ?? { body: FILE_VIEWER_PAGE, contentType: 'text/html' });
  });
  await page.goto(`${FILE_VIEWER.origin}/${encodeURIComponent(file.name)}`, {
    timeout: WEB_DRIVER.gotoTimeoutMs,
  });
  await page.waitForFunction('window.__qazinhoFile !== undefined', undefined, {
    timeout: FILE_VIEWER.openLimitMs,
  });

  const failure = await page.evaluate<string | null>('window.__qazinhoFile');

  if (failure !== null) throw new Error(`${file.name} did not open: ${failure}.`);
}
