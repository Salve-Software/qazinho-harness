import type { Frame, Page } from 'playwright-core';
import { numberDuplicates } from '@/engine/devices/library';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { frameRootsOf } from './frameRootsOf';
import { listControls } from './listControls';

/**
 * O que o agente pode ver: o que uma pessoa veria, não o markup, com os controles que
 * dizem o mesmo numerados, e o que cada iframe mostra na seção dele.
 */
export async function describePage(page: Page): Promise<string> {
  const [, ...frames] = await frameRootsOf(page);
  const inside = await Promise.all(
    frames.map(async ({ scope, name }) => [
      `FRAME "${name ?? 'untitled'}" (a page shown inside the page: what it shows answers to look, click and fill like the rest):`,
      ...(await partOf(scope)),
    ]),
  );

  return [
    `URL: ${page.url()}`,
    `TITLE: ${await page.title()}`,
    ...(await partOf(page)),
    ...inside.flat(),
  ].join('\n');
}

async function partOf(scope: Page | Frame): Promise<string[]> {
  const text = (
    await scope
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, WEB_DRIVER.pageTextLimit);

  const listed = (await listControls(scope)).slice(0, WEB_DRIVER.elementLimit);
  const controls = listed.map(({ role, label, testId }) =>
    testId === null ? `${role}: ${label}` : `${role}: ${label} [testid=${testId}]`,
  );

  return [
    'TEXT:',
    text,
    listed.some(({ testId }) => testId !== null)
      ? 'CONTROLS (target one with a [testid=…] as testid=…, which holds when its words change):'
      : 'CONTROLS:',
    ...numberDuplicates(controls),
  ];
}
