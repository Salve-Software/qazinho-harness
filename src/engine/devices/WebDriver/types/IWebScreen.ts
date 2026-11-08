import type { CDPSession, Page } from 'playwright-core';

/** Uma tela aberta no navegador: a página, de que conta ela é, e a transmissão dela. */
export interface IWebScreen {
  id: number;
  page: Page;
  account: number;
  opener: Page | null;
  cast: CDPSession | null;
}
