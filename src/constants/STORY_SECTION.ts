export const STORY_SECTION = {
  title: 'The Jira story',
  descriptionChars: 12_000,
  criteria:
    "Acceptance criteria, numbered for you to cite in each case's sources as C1, C2 and so on:",
  readiness: {
    ready: "It is in the team's ready-for-test column: the app should have it now.",
    ahead:
      "It has not reached the team's ready-for-test column yet, so the app may not have it: plan it before the app.",
  },
} as const;
