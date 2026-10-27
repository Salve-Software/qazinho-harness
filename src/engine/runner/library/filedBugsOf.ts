import type { IKnownBug } from '@/contract';
import type { IFiledBugs, IWalkLog } from '@/engine/runner/types';
import { bugBodyOf } from './bugBodyOf';
import { catchesOf } from './catchesOf';
import { landingOf } from './landingOf';
import { videoSecondsOf } from './videoSecondsOf';

/**
 * Lands each failure and finding of a walk on a bug: one the job named, one this run
 * filed, or a new one.
 */
export function filedBugsOf(props: {
  log: IWalkLog;
  known: IKnownBug[];
  caseTitleOf: (caseId: string) => string;
  target: string;
  run: { id: string; when: string; videoStartedAt: number | null };
  keys: Record<string, string>;
}): IFiledBugs {
  const { log, known, run, keys } = props;
  const filed: IKnownBug[] = [];
  const found: IFiledBugs = { bugIds: new Map(), newBugs: [], sightings: [] };

  for (const caught of catchesOf(log)) {
    const landing = landingOf({ ...caught, known, filed });
    let bugId: string;

    if (landing.kind === 'new') {
      bugId = `${run.id}-bug-${String(found.newBugs.length + 1)}`;
      filed.push({
        id: bugId,
        title: caught.title.length > 0 ? caught.title : caught.action,
        caseId: caught.caseId,
        stepNumber: caught.stepNumber,
        isIncidental: caught.isIncidental,
      });
      found.newBugs.push({
        id: bugId,
        body: bugBodyOf({
          caught,
          caseTitle: props.caseTitleOf(caught.caseId),
          outcomes: log.outcomes,
          target: props.target,
          run,
          keys,
        }),
      });
    } else bugId = landing.bugId;

    if (landing.kind === 'known' && !found.sightings.some((one) => one.bugId === bugId))
      found.sightings.push({
        bugId,
        sighting: {
          runId: run.id,
          runWhen: run.when,
          caseId: caught.caseId,
          stepNumber: caught.stepNumber,
          shot: caught.shotFile === null ? null : (keys[caught.shotFile] ?? null),
          at:
            run.videoStartedAt === null
              ? null
              : videoSecondsOf({ at: caught.at, startedAt: run.videoStartedAt }),
        },
      });

    if (!caught.isIncidental) found.bugIds.set(caught.index, bugId);
  }

  return found;
}
