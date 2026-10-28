import type { IBugBody } from './IBugBody';
import type { ISightingBody } from './ISightingBody';

/**
 * Onde caíram as falhas e os achados de uma run: o bug em que cada passo que falhou
 * quebrou, os bugs que ela abre como novos, e cada bug aberto que ela viu de novo.
 */
export interface IFiledBugs {
  bugIds: Map<number, string>;
  newBugs: { id: string; body: IBugBody }[];
  sightings: { bugId: string; sighting: ISightingBody }[];
}
