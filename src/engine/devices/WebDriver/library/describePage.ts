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

  const listed = (await listControls(page)).slice(0, WEB_DRIVER.elementLimit);
  const controls = listed.map(({ role, label, testId }) =>
    testId === null ? `${role}: ${label}` : `${role}: ${label} [testid=${testId}]`,
  );

  return [
    `URL: ${page.url()}`,
    `TITLE: ${await page.title()}`,
    'TEXT:',
    text,
    listed.some(({ testId }) => testId !== null)
      ? 'CONTROLS (target one with a [testid=…] as testid=…, which holds when its words change):'
      : 'CONTROLS:',
    ...numberDuplicates(controls),
  ].join('\n');
}
