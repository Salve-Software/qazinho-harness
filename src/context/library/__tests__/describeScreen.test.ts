import type { IAppSnapshot } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeScreen } from '@/context/library';

const APP: IAppSnapshot = {
  screen: 'workspace',
  openWorkspaceId: 'w-1',
  openTab: 'runs',
  openRunId: 'r-03',
  openBugId: null,
  language: 'pt',
  theme: 'night',
  runAlert: 'system',
  agent: 'Claude Code',
  integrations: [],
  projects: [],
  workspaces: [
    {
      id: 'w-1',
      name: 'Checkout',
      projectId: 'p-1',
      target: 'web',
      cases: 2,
      steps: 5,
      runs: 3,
      bugs: 1,
      latestRun: null,
      isRunning: false,
      isAnswering: false,
      openQuestions: 0,
      design: null,
    },
  ],
};

describe('describeScreen', () => {
  it('names the workspace on screen, the tab beside its chat and the run open on it', () => {
    expect(describeScreen(APP)).toEqual({
      title: 'On screen',
      lines: [
        'The QA is on the workspace "Checkout" (w-1), on its chat, with its runs tab open in the panel beside it, with run r-03 open.',
      ],
    });
  });

  it('says the panel is hidden when only the chat shows', () => {
    expect(describeScreen({ ...APP, openTab: null, openRunId: null }).lines).toEqual([
      'The QA is on the workspace "Checkout" (w-1), on its chat, with the panel beside it hidden.',
    ]);
  });

  it('names the bug open on the bugs tab, and nothing open on another tab', () => {
    expect(
      describeScreen({ ...APP, openTab: 'bugs', openRunId: null, openBugId: 'BUG-02' })
        .lines,
    ).toEqual([
      'The QA is on the workspace "Checkout" (w-1), on its chat, with its bugs tab open in the panel beside it, with bug BUG-02 open.',
    ]);
    expect(describeScreen({ ...APP, openTab: 'plan' }).lines).toEqual([
      'The QA is on the workspace "Checkout" (w-1), on its chat, with its plan tab open in the panel beside it.',
    ]);
  });

  it('says home or settings when no workspace is on screen', () => {
    expect(describeScreen({ ...APP, screen: 'settings' }).lines).toEqual([
      "The QA is in QAzinho's settings.",
    ]);
    expect(
      describeScreen({ ...APP, screen: 'home', openWorkspaceId: null }).lines,
    ).toEqual(["The QA is on QAzinho's home."]);
  });

  it('falls back to home when the workspace on screen is gone', () => {
    expect(describeScreen({ ...APP, openWorkspaceId: 'w-9' }).lines).toEqual([
      "The QA is on QAzinho's home.",
    ]);
  });
});
