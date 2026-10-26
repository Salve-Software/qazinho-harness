import type { RunnerJob } from '@/engine/runner/types';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';

/** Where a bug was caught, as its card names it: the browser and its window, or the phone. */
export function bugTargetOf(target: RunnerJob['target']): string {
  if (target.kind === 'ios') return 'iOS';

  if (target.kind === 'android') return 'Android';

  return `Web · Chrome ${String(WEB_DRIVER.viewport.width)} × ${String(WEB_DRIVER.viewport.height)}`;
}
