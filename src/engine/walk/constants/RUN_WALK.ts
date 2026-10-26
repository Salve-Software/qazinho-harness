export const RUN_WALK = {
  holdMs: 250,
  costsWaitMs: 3_000,
  profiles: 'profiles',
  proofChecks: 3,
  proofWaitMs: 700,
  hiddenFromLength: 4,
  exploreGraceMs: 90_000,
  askWaitMs: 15 * 60_000,
  toolMarginMs: 60_000,
  callBodyChars: 300,
  callsListed: 30,
  bodyShownChars: 3_000,
} as const;
