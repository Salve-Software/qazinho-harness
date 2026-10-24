/** What the agent that built the app answered: where the .apk or .app is, what it built, or why it could not. */
export interface IBuildAnswer {
  artifact: string;
  summary: string;
  failure: string;
}
