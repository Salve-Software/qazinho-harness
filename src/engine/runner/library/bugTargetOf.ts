import type { RunnerJob } from '@/engine/runner/types';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';

/**
 * Onde um bug foi pego, como o card o nomeia: o navegador e a janela dele, ou o celular.
 */
export function bugTargetOf(target: RunnerJob['target']): string {
  if (target.kind === 'ios') return 'iOS';

  if (target.kind === 'android') return 'Android';

  return `Web · Chrome ${String(WEB_DRIVER.viewport.width)} × ${String(WEB_DRIVER.viewport.height)}`;
}
