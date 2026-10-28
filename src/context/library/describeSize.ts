import type { IViewport } from '@/contract';

/**
 * O único tamanho em que um plano web roda, para o agente nunca planejar um caso para um
 * tamanho que a run não aceita.
 */
export function describeSize(viewport: IViewport | null): string[] {
  if (viewport === null) return [];

  return [
    `Its runs drive Chrome at ${String(viewport.width)} × ${String(viewport.height)}, the size the QA picked for the device.`,
    'A case cannot pick a size of its own: to cover another size, the QA switches the device and runs the plan again.',
  ];
}
