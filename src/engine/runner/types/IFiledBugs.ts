import type { IBugBody } from './IBugBody';
import type { ISightingBody } from './ISightingBody';

/**
 * Where a run's failures and findings landed: the bug each failed step broke on, the bugs
 * it files new, and each open bug it saw again.
 */
export interface IFiledBugs {
  bugIds: Map<number, string>;
  newBugs: { id: string; body: IBugBody }[];
  sightings: { bugId: string; sighting: ISightingBody }[];
}
