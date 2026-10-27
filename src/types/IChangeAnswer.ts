/**
 * What the agent that changed a team's suite answered: passing, app wrong or gave up, and
 * what it wrote.
 */
export interface IChangeAnswer {
  outcome: 'changed' | 'app-bug' | 'gave-up';
  summary: string;
  commit: string;
  title: string;
  body: string;
}
