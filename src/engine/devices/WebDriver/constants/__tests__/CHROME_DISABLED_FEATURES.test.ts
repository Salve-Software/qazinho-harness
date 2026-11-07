import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHROME_DISABLED_FEATURES } from '@/engine/devices/WebDriver/constants';

/**
 * O Chrome lê só o último `--disable-features` da linha de comando, então o nosso, que vem
 * depois do do Playwright, precisa repetir cada feature que o Playwright desliga.
 */
function playwrightDisabledFeatures(): string[] {
  const root = dirname(
    createRequire(import.meta.url).resolve('playwright-core/package.json'),
  );
  const file = [
    join(root, 'lib', 'coreBundle.js'),
    join(root, 'lib', 'server', 'chromium', 'chromiumSwitches.js'),
  ].find((path) => existsSync(path));

  if (file === undefined) throw new Error('playwright-core moved its Chromium switches');

  const source = readFileSync(file, 'utf8');
  const start = source.indexOf('disabledFeatures = [');
  const end = source.indexOf(']', start);
  const list = source
    .slice(start, end)
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

  return [...list.matchAll(/["']([A-Za-z]+)["']/g)].map(([, name]) => name ?? '');
}

describe('CHROME_DISABLED_FEATURES', () => {
  it('keeps every feature Playwright turns off, since ours replaces its switch', () => {
    const playwright = playwrightDisabledFeatures();

    expect(playwright.length).toBeGreaterThan(5);
    expect(CHROME_DISABLED_FEATURES).toEqual(expect.arrayContaining(playwright));
  });

  it('stops Chrome cloning its own app, which asks macOS to manage apps for QAzinho', () => {
    expect(CHROME_DISABLED_FEATURES).toContain('MacAppCodeSignClone');
  });

  it('names each feature once', () => {
    expect(new Set(CHROME_DISABLED_FEATURES).size).toBe(CHROME_DISABLED_FEATURES.length);
  });
});
