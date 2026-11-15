import type { BrowserContext } from 'playwright-core';

/**
 * A sessão de um app web guardada só na memória da run, para o caso seguinte começar
 * dentro da conta: os cookies e o localStorage de cada site.
 */
export type IWebSession = Awaited<ReturnType<BrowserContext['storageState']>>;
