import { describe, expect, it, vi } from 'vitest';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { openApp } from '@/engine/devices/WebDriver/library';

const URL = 'https://preview.loja.dev';

const pageThat = (...failures: string[]) => {
  const left = [...failures];

  return {
    goto: vi.fn(() => {
      const failure = left.shift();

      return failure === undefined
        ? Promise.resolve(null)
        : Promise.reject(new Error(failure));
    }),
  };
};

describe('openApp', () => {
  /** Um job terminou com o erro cru do Chrome porque o preview ainda não resolvia. */
  it('waits for an address that is still on its way', async () => {
    const page = pageThat('net::ERR_NAME_NOT_RESOLVED', 'net::ERR_CONNECTION_REFUSED');

    await openApp({ page, url: URL, retryMs: 0 });

    expect(page.goto).toHaveBeenCalledTimes(3);
  });

  it('says in words an address that never came', async () => {
    const page = pageThat(
      ...Array.from({ length: WEB_DRIVER.appTries }, () => 'net::ERR_NAME_NOT_RESOLVED'),
    );

    await expect(openApp({ page, url: URL, retryMs: 0 })).rejects.toThrow(
      `Could not open ${URL}: its address does not exist yet.`,
    );
    expect(page.goto).toHaveBeenCalledTimes(WEB_DRIVER.appTries);
  });

  it('does NOT wait on a failure that waiting will not fix', async () => {
    const page = pageThat('net::ERR_CERT_DATE_INVALID');

    await expect(openApp({ page, url: URL, retryMs: 0 })).rejects.toThrow(
      'net::ERR_CERT_DATE_INVALID',
    );
    expect(page.goto).toHaveBeenCalledTimes(1);
  });
});
