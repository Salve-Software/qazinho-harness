import type { IScreenElement } from '@/engine/devices/IosDriver/types';
import { IOS } from '@/engine/devices/IosDriver/constants';
import { numberDuplicates } from '@/engine/devices/library';

/** What the agent is allowed to look at: what a person would read on the screen, and the home screen said as such when the app is not open. */
export function describeIosScreen(props: {
  elements: IScreenElement[];
  app: string;
}): string {
  const isHome = props.elements.some(({ isLaunchIcon }) => isLaunchIcon);
  const labelled = props.elements.filter((one) => one.label.length > 0);

  const text = labelled
    .map((one) => one.label)
    .join('\n')
    .slice(0, IOS.screenTextLimit);

  const controls = labelled
    .slice(0, IOS.controlLimit)
    .map((one) => `${one.role.toLowerCase()}: ${one.label.slice(0, IOS.labelLimit)}`);

  return [
    isHome ? `APP: the home screen, ${props.app} is not open` : `APP: ${props.app}`,
    'TEXT:',
    text,
    'CONTROLS:',
    ...numberDuplicates(controls),
  ].join('\n');
}
