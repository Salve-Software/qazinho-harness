import type { Page } from 'playwright-core';
import { FILE_TEXT_IN_VIEW, FILE_VIEWER } from '@/engine/devices/WebDriver/constants';

/** O que o agente lê de um arquivo aberto: só a parte à vista, que o scroll troca. */
export async function describeFilePage(page: Page): Promise<string> {
  const text = await page.evaluate<string>(FILE_TEXT_IN_VIEW).catch(() => '');

  return [
    `URL: ${page.url()}`,
    `TITLE: ${await page.title()}`,
    'TEXT (the part of the file in view, scroll shows the rest):',
    text.slice(0, FILE_VIEWER.textInView),
  ].join('\n');
}
