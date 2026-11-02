import type { Page } from 'playwright-core';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';

const COMING =
  /ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_TUNNEL/;

const IN_WORDS: [RegExp, string][] = [
  [/ERR_NAME_NOT_RESOLVED/, 'its address does not exist yet'],
  [/ERR_CONNECTION_REFUSED/, 'nothing answers there'],
];

/**
 * Abre o app, esperando um endereço que ainda vem vindo, como o de um preview recém-criado;
 * o que nunca abre é dito em palavras.
 */
export async function openApp(props: {
  page: Pick<Page, 'goto'>;
  url: string;
  retryMs?: number;
}): Promise<void> {
  const { page, url, retryMs = WEB_DRIVER.appRetryMs } = props;

  for (let tries = 1; ; tries += 1) {
    try {
      await page.goto(url, { timeout: WEB_DRIVER.gotoTimeoutMs });

      return;
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : String(failure);

      if (!COMING.test(message) || tries >= WEB_DRIVER.appTries)
        throw new Error(failureOf({ url, message }));

      await new Promise((wake) => setTimeout(wake, retryMs));
    }
  }
}

function failureOf(props: { url: string; message: string }): string {
  const words = IN_WORDS.find(([code]) => code.test(props.message))?.[1];

  return words === undefined ? props.message : `Could not open ${props.url}: ${words}.`;
}
