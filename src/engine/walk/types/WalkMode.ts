/**
 * How a run walks its cases: from their recordings with the agent for the rest (`plan`),
 * from their recordings alone (`recorded`), or every case by the agent (`agent`).
 */
export type WalkMode = 'plan' | 'recorded' | 'agent';
