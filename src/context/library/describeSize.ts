import type { IViewport } from '@/contract';

/**
 * The one size a web plan runs at, so the agent never plans a case for a size the run
 * cannot take.
 */
export function describeSize(viewport: IViewport | null): string[] {
  if (viewport === null) return [];

  return [
    `Its runs drive Chrome at ${String(viewport.width)} × ${String(viewport.height)}, the size the QA picked for the device.`,
    'A case cannot pick a size of its own: to cover another size, the QA switches the device and runs the plan again.',
  ];
}
