import type { Language } from '@/contract';

/** What the reader weighs a pull request with: the PR as its team wrote it, its files with their patches, the issue it closes, the project's plans, the steps QAzinho found whose words it takes out, and a case someone on the team asked for on the PR, in their words. */
export interface IPullBrief {
  pull: {
    repository: string;
    number: number;
    title: string;
    body: string;
    headBranch: string;
    baseBranch: string;
  };
  files: { path: string; status: string; patch: string | null }[];
  issue: { number: number; title: string; body: string } | null;
  plans: {
    id: string;
    name: string;
    cases: {
      id: string;
      title: string;
      goal: string;
      steps: { action: string; expected: string }[];
    }[];
  }[];
  found: {
    planId: string;
    caseId: string;
    step: number;
    text: string;
    replacement: string | null;
    file: string;
  }[];
  asked: string | null;
  language: Language;
}
