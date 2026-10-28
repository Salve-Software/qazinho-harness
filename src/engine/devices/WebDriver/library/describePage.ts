import type { Page } from 'playwright-core';
import { numberDuplicates } from '@/engine/devices/library';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { listControls } from './listControls';

/**
 * O que o agente pode ver: o que uma pessoa veria, não o markup, com os controles que
 * dizem o mesmo numerados.
 */
export async function describePage(page: Page): Promise<string> {
  const text = (
    await page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, WEB_DRIVER.pageTextLimit);

  const controls = (await listControls(page))
    .slice(0, WEB_DRIVER.elementLimit)
    .map(({ role, label }) => `${role}: ${label}`);

  return [
    `URL: ${page.url()}`,
    `TITLE: ${await page.title()}`,
    'TEXT:',
    text,
    'CONTROLS:',
    ...numberDuplicates(controls),
  ].join('\n');
}
