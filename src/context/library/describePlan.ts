import type { IFlatStep } from '@/contract';

/**
 * The plan the workspace holds, every field of every case, so the agent can talk about it
 * or change it and keep the rest.
 */
export function describePlan(steps: IFlatStep[]): string[] {
  if (steps.length === 0) return ['The workspace has no plan yet.'];

  const lines: string[] = ['The plan the workspace holds right now:'];
  let caseId = '';

  for (const step of steps) {
    if (step.caseId !== caseId) {
      caseId = step.caseId;
      lines.push(`${step.caseId} · ${step.caseTitle} · ${step.casePriority}`);

      if (step.caseGoal.length > 0) lines.push(`  Goal: ${step.caseGoal}`);

      if (step.casePreconditions.length > 0)
        lines.push(`  Preconditions: ${step.casePreconditions}`);
    }

    lines.push(`  ${String(step.numberInCase)}. ${step.action} → ${step.expected}`);
  }

  return lines;
}
