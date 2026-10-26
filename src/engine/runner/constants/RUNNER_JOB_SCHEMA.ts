import { z } from 'zod';

const KIND = z.enum(['web', 'android', 'ios']);

const ACTION = z.object({
  kind: z.enum([
    'goto',
    'reopen',
    'click',
    'fill',
    'press',
    'wait',
    'scroll',
    'long_press',
    'drag',
    'hover',
    'upload',
  ]),
  target: z.string(),
  value: z.string(),
  dialog: z.enum(['ok', 'cancel']).optional(),
  promptText: z.string().optional(),
  locator: z.string().optional(),
  toLocator: z.string().optional(),
  option: z.string().optional(),
});

export const RUNNER_JOB_SCHEMA = z.object({
  job: z.object({
    id: z.string(),
    platform: KIND,
    mode: z.enum(['plan', 'recorded', 'agent']),
    attempt: z.number().int(),
    language: z.enum(['en', 'pt']),
    origin: z.string(),
    originLabel: z.string(),
  }),
  deadline: z.string(),
  aiCreditCap: z.number(),
  agent: z.enum(['gateway', 'claude-code', 'none']),
  model: z.string().nullable().catch(null),
  project: z.object({ id: z.string(), key: z.string(), name: z.string() }),
  target: z.object({ kind: KIND, label: z.string(), value: z.string() }),
  plans: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      version: z.number(),
      cases: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          priority: z.string(),
          goal: z.string(),
          preconditions: z.string(),
          steps: z.array(
            z.object({
              action: z.string(),
              expected: z.string(),
              frame: z.string().optional(),
            }),
          ),
        }),
      ),
    }),
  ),
  recordings: z.array(
    z.object({
      planId: z.string(),
      caseId: z.string(),
      fingerprint: z.string(),
      targetKind: KIND,
      steps: z.array(z.unknown()),
      recordedAt: z.string(),
    }),
  ),
  bugs: z.array(
    z.object({
      id: z.string(),
      planId: z.string(),
      title: z.string(),
      caseId: z.string(),
      stepNumber: z.number().int(),
      isIncidental: z.boolean().catch(false),
      status: z.string(),
    }),
  ),
  variables: z.array(
    z.object({ name: z.string(), description: z.string().nullable(), value: z.string() }),
  ),
  build: z.object({ fileName: z.string(), size: z.number() }).nullable(),
});

export const RECORDED_STEPS_SCHEMA = z.array(
  z.object({
    number: z.number().int().positive(),
    actions: z.array(ACTION),
    proof: z.string(),
  }),
);
