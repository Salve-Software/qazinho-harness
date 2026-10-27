import type { Language } from '@/contract';

/**
 * What the reader weighs a pull request with: the PR, its patches, its issue, the plans
 * and the cases asked.
 */
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
  asked: string[];
  language: Language;
}
