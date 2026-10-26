export const RUNNER = {
  heartbeatMs: 30_000,
  deadlineMarginMs: 180_000,
  unwalked: 'The run ended before it reached this step.',
  network: 'network.json',
  video: 'run.mp4',
  build: 'build',
  profile: 'profile',
  runs: 'runs',
} as const;
