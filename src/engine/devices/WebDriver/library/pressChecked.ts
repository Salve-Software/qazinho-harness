import type { Frame, Locator } from 'playwright-core';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';

type Probed = { __qazinho?: { pressed?: boolean } };

/**
 * Aperta um alvo e confere que o documento dele recebeu o aperto: o Chrome aceita um
 * clique que a página nunca vê, e sem isso ele responderia que deu certo.
 */
export async function pressChecked(props: {
  locator: Locator;
  target: string;
  press: () => Promise<void>;
}): Promise<void> {
  const frame = await frameOf(props.locator);

  await arm(frame);
  await props.press();

  if (await wasPressed(frame)) return;

  await new Promise((wake) => setTimeout(wake, WEB_DRIVER.pressGraceMs));

  if (await wasPressed(frame)) return;

  throw new Error(
    `The click on "${props.target}" never reached the page: the browser held it back, so this says nothing about the app.`,
  );
}

async function frameOf(locator: Locator): Promise<Frame | null> {
  const handle = await locator.elementHandle().catch(() => null);
  const frame = (await handle?.ownerFrame().catch(() => null)) ?? null;

  await handle?.dispose().catch(() => undefined);

  return frame;
}

async function arm(frame: Frame | null): Promise<void> {
  await frame
    ?.evaluate(() => {
      const { __qazinho: probe } = globalThis as unknown as Probed;

      if (probe !== undefined) probe.pressed = false;
    })
    .catch(() => undefined);
}

async function wasPressed(frame: Frame | null): Promise<boolean> {
  if (frame === null) return true;

  return frame
    .evaluate(() => (globalThis as unknown as Probed).__qazinho?.pressed !== false)
    .catch(() => true);
}
