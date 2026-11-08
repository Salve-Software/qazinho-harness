import type { BugCategory } from './BugCategory';
import type { IScreenBox } from './IScreenBox';
import type { Severity } from './Severity';

/**
 * Um bug que o runner abriu ao lado de um passo, com a tela e o quando; `sameAs` nomeia
 * um bug aberto visto de novo.
 */
export interface IRunFinding {
  caseId: string;
  stepNumber: number;
  index: number;
  action: string;
  title: string;
  severity: Severity;
  at: number;
  expected: string;
  got: string;
  screenshot: string | null;
  shotFile: string | null;
  sameAs?: string;
  frame?: string;
  category?: BugCategory;
  box?: IScreenBox;
}
