import type { IAppSnapshot } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeApp } from '@/context/library';

const EMPTY: IAppSnapshot = {
  screen: 'home',
  openWorkspaceId: null,
  openTab: null,
  openRunId: null,
  openBugId: null,
  language: 'en',
  theme: 'paper',
  runAlert: 'app',
  agent: 'Codex',
  integrations: [
    { id: 'github', account: null },
    { id: 'jira', account: null },
  ],
  projects: [],
  workspaces: [],
};

const FULL: IAppSnapshot = {
  ...EMPTY,
  language: 'pt',
  theme: 'night',
  runAlert: 'system',
  agent: 'Claude Code',
  integrations: [
    { id: 'github', account: 'octoqa' },
    { id: 'jira', account: null },
  ],
  projects: [
    {
      id: 'p-1',
      name: 'Lojinha',
      targets: [
        { kind: 'web', value: 'https://loja.test' },
        { kind: 'android', value: '/Users/qa/loja.apk' },
      ],
      repositories: [{ name: 'acme/loja-web', base: 'develop' }],
      variables: [
        { name: 'LOJA_EMAIL', description: 'A buyer on staging' },
        { name: 'LOJA_PASSWORD', description: '' },
      ],
    },
  ],
  workspaces: [
    {
      id: 'w-1',
      name: 'Checkout',
      projectId: 'p-1',
      target: 'web',
      cases: 1,
      steps: 4,
      runs: 3,
      bugs: 2,
      latestRun: {
        id: 'r-03',
        startedOn: '2026-10-20',
        startedAt: '10:42',
        endedBy: 'stopped',
        passed: 3,
        failed: 1,
        blocked: 0,
        skipped: 0,
      },
      isRunning: true,
      isAnswering: true,
      openQuestions: 0,
      design: null,
    },
    {
      id: 'w-2',
      name: 'Login',
      projectId: 'p-1',
      target: 'android',
      cases: 0,
      steps: 0,
      runs: 0,
      bugs: 0,
      latestRun: null,
      isRunning: false,
      isAnswering: false,
      openQuestions: 3,
      design: null,
    },
  ],
};

describe('describeApp', () => {
  it('tells the settings, the trackers, and every project and workspace by id', () => {
    expect(describeApp(FULL)).toEqual({
      title: 'QAzinho now',
      lines: [
        'The QA reads QAzinho in Brazilian Portuguese, on the theme it calls Noite. A run that ends while they are away calls them with a notification and its sound.',
        'On their screen, home is Início; settings is Configurações, with Agentes, Dispositivos, Integrações, MCPs, Aparência and Atalhos; a workspace keeps its chat in the middle, with a panel beside it whose tabs are Plano, Device, Runs and Bugs; and you are the Estagiário.',
        'Their agent is Claude Code. GitHub is connected as octoqa. Jira is not connected.',
        'Projects:',
        '- p-1 "Lojinha": web https://loja.test · android /Users/qa/loja.apk · repository acme/loja-web, base develop',
        '  - variable ${LOJA_EMAIL}: A buyer on staging',
        '  - variable ${LOJA_PASSWORD}',
        'Workspaces:',
        '- w-1 "Checkout" in p-1, on web: 1 case, 4 steps · 3 runs, the latest r-03 on 2026-10-20 at 10:42 stopped by the QA: 3 passed, 1 failed, 0 blocked, 0 skipped · 2 bugs · running now · its chat agent is answering',
        '- w-2 "Login" in p-1, on android: no plan yet · no runs · no bugs · its chat waits on the QA\'s answers to 3 questions',
      ],
    });
  });

  it('says which workspace is checked against a Figma design', () => {
    const [checkout, login] = FULL.workspaces;
    const lines = describeApp({
      ...FULL,
      workspaces: [{ ...checkout!, design: 'Shop' }, login!],
    }).lines;

    expect(lines.find((line) => line.startsWith('- w-1'))).toContain(
      'checked against the Figma design "Shop"',
    );
    expect(lines.find((line) => line.startsWith('- w-2'))).not.toContain('Figma');
  });

  it('says there is nothing yet, and how a quiet QAzinho calls the QA', () => {
    expect(describeApp(EMPTY).lines).toEqual([
      'The QA reads QAzinho in English, on the theme it calls Paper. A run that ends calls them only inside QAzinho.',
      'On their screen, home is Home; settings is Settings, with Agents, Devices, Integrations, MCPs, Appearance and Shortcuts; a workspace keeps its chat in the middle, with a panel beside it whose tabs are Plan, Device, Runs and Bugs; and you are the Intern.',
      'Their agent is Codex. GitHub is not connected. Jira is not connected.',
      'There are no projects yet.',
    ]);
  });

  it('says a project has no workspace yet', () => {
    expect(describeApp({ ...FULL, workspaces: [] }).lines.at(-1)).toBe(
      'There are no workspaces yet.',
    );
  });
});
