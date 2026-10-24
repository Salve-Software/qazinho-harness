/** What the agent that changed a team's suite answered: whether the test passes with its change, the app is wrong, or it gave up, what it did, and the commit and pull request it wrote. */
export interface IChangeAnswer {
  outcome: 'changed' | 'app-bug' | 'gave-up';
  summary: string;
  commit: string;
  title: string;
  body: string;
}
