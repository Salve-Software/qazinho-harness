import type {
  IAppSnapshot,
  IChatReference,
  ICodeCopy,
  IFlatStep,
  IJiraStoryCopy,
} from '@/contract';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'vitest';
import {
  Harness,
  registerAppTools,
  registerSourceTools,
  registerDeviceTools,
  registerSuiteTools,
} from '@/index';

/**
 * Os arquivos em __prompts__ são o que o agente lia antes de o harness ir para
 * src/harness/. Qualquer mudança no que o agente ouve aparece aqui como diff de um deles,
 * de propósito.
 */
const COUPON = {
  caseId: 'TC-01',
  caseTitle: 'Coupon',
  casePriority: 'P1',
  caseGoal: 'A valid coupon takes 10% off.',
  casePreconditions: 'One product in the cart.',
};

const STEPS: IFlatStep[] = [
  { ...COUPON, numberInCase: 1, action: 'Open the cart', expected: 'The cart shows' },
  { ...COUPON, numberInCase: 2, action: 'Apply SAVE10', expected: '10% off' },
];

const REFERENCES: IChatReference[] = [
  {
    kind: 'bug',
    id: 'BUG-01',
    title: 'Expired coupon',
    facts: ['severity high', 'got: accepted'],
  },
];

const RUNS = [
  {
    kind: 'run' as const,
    id: 'r-02',
    title: 'The whole plan · 10:02',
    facts: [
      'started 10:02, took 84s, cost $0.041, walked the whole plan',
      'cases: 1 passed, 1 failed, 0 blocked, 0 skipped',
      'steps: 2 passed, 1 failed, 0 blocked, 0 skipped',
      'TC-02 Checkout: failed',
      '  step 1 failed: Apply EXPIRED10 (The expired coupon took 10% off.)',
      'note: Closed a cookie banner first.',
    ],
  },
];

const harness = new Harness();
const DESKTOP = { width: 1280, height: 800 };

const DESIGN = {
  url: 'https://www.figma.com/design/AbC123/Shop?node-id=1-23',
  fileKey: 'AbC123',
  nodeId: '1:23',
  name: 'Shop',
};

const EMPTY_CHAT = {
  text: 'Hi',
  told: {},
  target: null,
  viewport: null,
  steps: [],
  references: [],
  runs: [],
  look: null,
  code: null,
  story: null,
  page: null,
  design: null,
  variables: [],
};

const CODE: ICodeCopy = {
  repository: 'acme/loja-web',
  branch: 'feat/cupom',
  base: 'develop',
  commit: 'aaa1111222233334444',
  baseCommit: 'bbb2222333344445555',
  root: '/data/code/w-1',
  dir: '/data/code/w-1/acme/loja-web',
  diffFile: '/data/code/w-1/acme-loja-web.diff',
  changes: [{ path: 'src/Coupon.tsx', status: 'modified', additions: 40, deletions: 3 }],
  changedFiles: 1,
  commits: 2,
};

const STORY: IJiraStoryCopy = {
  story: {
    key: 'SHOP-12',
    url: 'https://acme.atlassian.net/browse/SHOP-12',
    summary: 'Aplicar cupom no checkout',
    type: 'Story',
    status: 'To Do',
    priority: 'High',
    labels: [],
    components: [],
    parent: '',
    description: 'O cliente aplica um cupom de desconto no checkout.',
    acceptance: [
      {
        field: 'Acceptance criteria',
        text: '- SAVE10 takes 10% off\n- An expired coupon is refused',
      },
    ],
    comments: [],
    links: [],
    subtasks: [],
    attachments: [],
  },
  root: '/data/jira/w-1/SHOP-12',
  files: [
    {
      filename: 'checkout.png',
      mimeType: 'image/png',
      size: 48_210,
      path: '/data/jira/w-1/SHOP-12/checkout.png',
      note: 'read',
    },
  ],
};

const FULL_CHAT = {
  text: 'Write a test plan for this app.',
  told: {},
  target: { kind: 'web' as const, value: 'https://shop.test' },
  viewport: DESKTOP,
  steps: STEPS,
  references: REFERENCES,
  runs: RUNS,
  look: {
    kind: 'web' as const,
    where: 'https://shop.test',
    isOpen: true as const,
    page: 'URL: https://shop.test/\nTITLE: Shop\nTEXT:\nNew in: summer shoes\nCONTROLS:\na: Cart\nbutton: Sign in',
  },
  code: null,
  story: null,
  page: null,
  design: null,
  variables: [{ name: 'SHOP_EMAIL', description: 'The buyer on staging' }],
};

const APP: IAppSnapshot = {
  screen: 'workspace',
  openWorkspaceId: 'w-1',
  openTab: 'bugs',
  openRunId: null,
  openBugId: 'BUG-01',
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
      name: 'Shop',
      targets: [{ kind: 'web', value: 'https://shop.test' }],
      repositories: [{ name: 'acme/shop-web', base: 'main' }],
      variables: [{ name: 'SHOP_EMAIL', description: 'The buyer on staging' }],
    },
  ],
  workspaces: [
    {
      id: 'w-1',
      name: 'Coupons',
      projectId: 'p-1',
      target: 'web',
      cases: 1,
      steps: 2,
      runs: 1,
      bugs: 1,
      latestRun: {
        id: 'r-02',
        startedOn: '2026-10-20',
        startedAt: '10:02',
        endedBy: 'finished',
        passed: 1,
        failed: 1,
        blocked: 0,
        skipped: 0,
      },
      isRunning: false,
      isAnswering: false,
      openQuestions: 0,
      design: null,
    },
  ],
};

describe('Harness', () => {
  describe('chat', () => {
    it('keeps the corpus alone in the system prompt, the one a resumed session holds on to', async () => {
      const chat = harness.chat(EMPTY_CHAT);

      await expect(chat.systemPrompt).toMatchFileSnapshot('./__prompts__/chat.txt');
      await expect(chat.schema).toMatchFileSnapshot('./__prompts__/chat-schema.txt');
    });

    it('opens the first message with the app, the plan, the runs, what QAzinho saw and what the QA pointed at', async () => {
      await expect(harness.chat(FULL_CHAT).prompt).toMatchFileSnapshot(
        './__prompts__/chat-message.txt',
      );
    });

    it('does NOT change the system prompt with what the workspace holds', () => {
      expect(harness.chat(FULL_CHAT).systemPrompt).toBe(
        harness.chat(EMPTY_CHAT).systemPrompt,
      );
    });

    it('tells a resumed chat what changed since its last message, and what the QA points at each time', () => {
      const first = harness.chat({ ...FULL_CHAT, runs: [] });
      const second = harness.chat({
        ...FULL_CHAT,
        told: first.told,
        text: 'What failed?',
      });

      expect(second.prompt).toContain(
        '## Runs in this workspace\nrun r-02 · The whole plan · 10:02',
      );
      expect(second.prompt).toContain('## What the QA pointed at\nbug BUG-01');
      expect(second.prompt).not.toContain('## This workspace');
      expect(second.prompt).not.toContain('## What QAzinho saw of the app');
      expect(second.prompt.endsWith('</qazinho>\n\nWhat failed?')).toBe(true);
    });

    it('opens a message planned from code with the branch, its diff, and the folder the agent may read', async () => {
      const chat = harness.chat({
        ...EMPTY_CHAT,
        text: 'Plan from this branch.',
        code: CODE,
      });

      await expect(chat.prompt).toMatchFileSnapshot('./__prompts__/chat-code.txt');
      expect(chat.readDirs).toEqual(['/data/code/w-1']);
      expect(harness.chat(EMPTY_CHAT).readDirs).toEqual([]);
    });

    it('opens a message planned from imported tests with the folder, and lets the agent read only it', async () => {
      const chat = harness.chat({
        ...EMPTY_CHAT,
        text: 'Plan from these tests.',
        source: {
          name: 'loja-e2e',
          dir: '/Users/qa/loja-e2e',
          frameworks: [{ id: 'playwright', files: 1 }],
          files: ['tests/cart.spec.ts'],
          branch: 'main',
          commit: 'aaa1111222233334444',
        },
      });

      await expect(chat.prompt).toMatchFileSnapshot('./__prompts__/chat-import.txt');
      expect(chat.readDirs).toEqual(['/Users/qa/loja-e2e']);
    });

    it('opens a message planned from a Jira story with the story, and the folder of its files', async () => {
      const chat = harness.chat({
        ...EMPTY_CHAT,
        text: 'Plan the tests for SHOP-12.',
        story: STORY,
      });

      await expect(chat.prompt).toMatchFileSnapshot('./__prompts__/chat-jira.txt');
      expect(chat.readDirs).toEqual(['/data/jira/w-1/SHOP-12']);
      expect(
        harness.chat({ ...EMPTY_CHAT, story: { ...STORY, files: [] } }).readDirs,
      ).toEqual([]);
    });

    it('opens a message planned from a Confluence page with its text, and gives the agent no folder for it', async () => {
      const chat = harness.chat({
        ...EMPTY_CHAT,
        text: 'Plan from the checkout cases.',
        page: {
          page: {
            id: '98304',
            title: 'Checkout: cenários',
            space: 'QA',
            url: 'https://acme.atlassian.net/wiki/spaces/QA/pages/98304',
          },
          text: '## CT01 · Cupom válido\n\n| # | Ação | Esperado |\n| --- | --- | --- |\n| 1 | Aplicar SAVE10 | Total com 10% off |',
        },
      });

      await expect(chat.prompt).toMatchFileSnapshot('./__prompts__/chat-confluence.txt');
      expect(chat.readDirs).toEqual([]);
    });

    it('lets the agent read the code and the story at once', () => {
      expect(harness.chat({ ...EMPTY_CHAT, code: CODE, story: STORY }).readDirs).toEqual([
        '/data/code/w-1',
        '/data/jira/w-1/SHOP-12',
      ]);
    });

    it('opens a message on a workspace with a design with its file and node, and lets the agent read it through the QA’s Figma', async () => {
      const chat = harness.chat({
        ...EMPTY_CHAT,
        text: 'Plan the checkout against the design.',
        design: DESIGN,
      });

      await expect(chat.prompt).toMatchFileSnapshot('./__prompts__/chat-design.txt');
      expect(chat.design).toEqual({
        servers: [{ name: 'figma', url: 'https://mcp.figma.com/mcp' }],
        allowedTools: [
          'mcp__figma__create_session',
          'mcp__figma__get_design_context',
          'mcp__figma__get_metadata',
          'mcp__figma__get_screenshot',
          'mcp__figma__get_variable_defs',
        ],
      });
      expect(harness.chat(EMPTY_CHAT).design).toEqual({ servers: [], allowedTools: [] });
    });

    it("tells the agent once that the story's files are gone after the plan", () => {
      const planning = harness.chat({ ...EMPTY_CHAT, story: STORY });
      const after = harness.chat({ ...EMPTY_CHAT, told: planning.told, text: 'Thanks' });

      expect(after.prompt).toContain("The story's files are gone");
      expect(
        harness.chat({ ...EMPTY_CHAT, told: after.told, text: 'And now?' }).prompt,
      ).toBe('And now?');
    });

    it('tells the agent once that the copy is gone after the plan, and never again', () => {
      const planning = harness.chat({ ...EMPTY_CHAT, code: CODE });
      const after = harness.chat({ ...EMPTY_CHAT, told: planning.told, text: 'Thanks' });

      expect(after.prompt).toContain('The copy of the code is gone');
      expect(
        harness.chat({ ...EMPTY_CHAT, told: after.told, text: 'And now?' }).prompt,
      ).toBe('And now?');
    });

    it('sends the QA words alone when nothing changed and nothing is pointed at', () => {
      const first = harness.chat(EMPTY_CHAT);

      expect(
        harness.chat({ ...EMPTY_CHAT, told: first.told, text: 'Thanks' }).prompt,
      ).toBe('Thanks');
    });

    it('tells the chat how the latest runs went, which it never walked itself', () => {
      const { prompt } = harness.chat({ ...EMPTY_CHAT, runs: RUNS });

      expect(prompt).toContain(
        '## Runs in this workspace\nrun r-02 · The whole plan · 10:02',
      );
      expect(prompt).toContain('  note: Closed a cookie banner first.');
    });

    it('says nothing of runs before the first one', () => {
      expect(harness.chat(EMPTY_CHAT).prompt).not.toContain('## Runs in this workspace');
    });

    /**
     * O MCP da empresa do QA é responsabilidade do próprio QA: o chat pode usá-lo, e o
     * QAzinho o libera.
     */
    it("names the tool that lets the chat use the QA's own MCP servers", () => {
      expect(harness.chat(EMPTY_CHAT).permissionTool).toBe(
        'mcp__qazinho__approve_permission',
      );
    });

    /**
     * O QA nomeou uma página do Confluence em palavras, e o chat não tinha como lê-la.
     */
    it("gives the chat the QA's Jira and Confluence to read, and no other tool of QAzinho", () => {
      expect(harness.chat(EMPTY_CHAT).tools).toEqual({
        groups: ['sources'],
        allowedTools: ['mcp__qazinho'],
      });
    });
  });

  describe('toldAfterReading', () => {
    /**
     * O agente leu a story pela própria ferramenta: a próxima mensagem a teria entregado
     * inteira de novo.
     */
    it('counts a story the agent read on its own as told, so the next message leaves it out', () => {
      const told = harness.toldAfterReading({ told: {}, story: STORY, page: null });
      const next = harness.chat({ ...EMPTY_CHAT, story: STORY, told });

      expect(next.prompt).not.toContain('## The Jira story');
    });

    it('does NOT touch what was told when the agent read nothing', () => {
      expect(
        harness.toldAfterReading({
          told: { 'This workspace': 'x' },
          story: null,
          page: null,
        }),
      ).toEqual({ 'This workspace': 'x' });
    });
  });

  describe('run', () => {
    it.each(['web', 'android', 'ios'] as const)(
      'briefs the agent on the %s device, with the app under test filled in',
      async (kind) => {
        const app = {
          web: 'https://shop.test',
          android: '/tmp/app.apk',
          ios: '/tmp/App.app',
        }[kind];

        await expect(
          harness.run({
            target: { kind, value: app },
            viewport: DESKTOP,
            language: 'en',
          }),
        ).toMatchFileSnapshot(`./__prompts__/run-${kind}.txt`);
      },
    );

    it('tells a web run the size of the window it drives', () => {
      expect(
        harness
          .run({
            target: { kind: 'web', value: 'x' },
            viewport: { width: 390, height: 844 },
            language: 'en',
          })
          .replace(/\s+/g, ' '),
      ).toContain('numa janela de 390 × 844, largura por altura em pixels');
    });

    it('has the runner write its verdicts in the language the QA reads, whatever the case is in', () => {
      const prompt = harness.run({
        target: { kind: 'web', value: 'x' },
        viewport: DESKTOP,
        language: 'pt',
      });

      expect(prompt.replace(/\s+/g, ' ')).toContain(
        'no idioma Brazilian Portuguese, o idioma em que o QA lê o QAzinho',
      );
      expect(prompt).not.toContain('{{language}}');
    });

    it('does NOT tell a run how to chat, nor the chat how to run', () => {
      expect(
        harness.run({
          target: { kind: 'web', value: 'x' },
          viewport: DESKTOP,
          language: 'en',
        }),
      ).not.toContain('## Conversando com o QA');
      expect(harness.chat(EMPTY_CHAT).systemPrompt).not.toContain('## Rodando um caso');
    });
  });

  describe('explore', () => {
    it('briefs the explorer on the device, the app and how long it has', async () => {
      await expect(
        harness.explore({
          target: { kind: 'web', value: 'https://shop.test' },
          viewport: DESKTOP,
          language: 'en',
          minutes: 10,
        }),
      ).toMatchFileSnapshot('./__prompts__/explore-web.txt');
    });

    it('does NOT tell the explorer how to walk a case, nor the runner how to explore', () => {
      const exploring = harness.explore({
        target: { kind: 'android', value: '/tmp/app.apk' },
        viewport: DESKTOP,
        language: 'pt',
        minutes: 5,
      });

      expect(exploring).toContain('## Explorando o app');
      expect(exploring).toContain('por cerca de 5 minutos');
      expect(exploring.replace(/\s+/g, ' ')).toContain('no idioma Brazilian Portuguese');
      expect(exploring).not.toContain('## Rodando um caso');
      expect(
        harness.run({
          target: { kind: 'web', value: 'x' },
          viewport: DESKTOP,
          language: 'en',
        }),
      ).not.toContain('## Explorando o app');
    });

    it('starts an exploration with its time, the variables and the screen', async () => {
      await expect(
        harness.startExploring({
          minutes: 10,
          screen: 'Shop\n[link] Cart',
          variables: [{ name: 'SHOP_EMAIL', description: 'The buyer on staging' }],
          known: [
            {
              id: 'BUG-01',
              title: 'The cart total reads R$ NaN',
              caseId: 'EX',
              stepNumber: 2,
              isIncidental: true,
            },
          ],
          design: null,
        }),
      ).toMatchFileSnapshot('./__prompts__/explore.txt');
    });

    it('gives the explorer the device, behind QAzinho own MCP server', () => {
      expect(harness.toolsFor('explorer')).toEqual({
        groups: ['device'],
        allowedTools: ['mcp__qazinho'],
      });
    });
  });

  describe('walk', () => {
    it('starts a case with its steps and the screen it starts on', async () => {
      await expect(
        harness.walk({
          steps: STEPS,
          screen: 'Cart\n[button] Apply',
          language: 'en',
          filed: [],
          known: [
            {
              id: 'BUG-01',
              title: 'An expired coupon is accepted',
              caseId: 'TC-03',
              stepNumber: 1,
              isIncidental: false,
            },
          ],
          variables: [
            { name: 'SHOP_EMAIL', description: 'The buyer account on staging' },
            { name: 'SHOP_PASSWORD', description: '' },
          ],
          design: null,
        }),
      ).toMatchFileSnapshot('./__prompts__/walk.txt');
      await expect(
        harness.walk({
          steps: [],
          screen: '',
          language: 'en',
          filed: [],
          known: [],
          variables: [],
          design: null,
        }),
      ).toMatchFileSnapshot('./__prompts__/walk-empty.txt');
    });
  });

  describe('assistant', () => {
    it('briefs the Estagiário in the corner, and nothing of a chat or a run', async () => {
      const { systemPrompt } = harness.assistant({ text: 'Oi', told: {}, app: APP });

      await expect(systemPrompt).toMatchFileSnapshot('./__prompts__/assistant.txt');
      expect(systemPrompt).not.toContain('## Conversando com o QA');
      expect(systemPrompt).not.toContain('## Rodando um caso');
    });

    it('opens the first message with what is on screen and every project and workspace', async () => {
      await expect(
        harness.assistant({ text: 'What broke in Coupons?', told: {}, app: APP }).prompt,
      ).toMatchFileSnapshot('./__prompts__/assistant-message.txt');
    });

    it('tells a resumed assistant only what changed, and nothing when nothing did', () => {
      const first = harness.assistant({ text: 'Oi', told: {}, app: APP });
      const moved = harness.assistant({
        text: 'And this one?',
        told: first.told,
        app: { ...APP, openTab: 'plan', openBugId: null },
      });

      expect(moved.prompt).toContain(
        '## On screen\nThe QA is on the workspace "Coupons" (w-1), on its chat, with its plan tab open in the panel beside it.',
      );
      expect(moved.prompt).not.toContain('## QAzinho now');
      expect(
        harness.assistant({
          text: 'Thanks',
          told: moved.told,
          app: { ...APP, openTab: 'plan', openBugId: null },
        }).prompt,
      ).toBe('Thanks');
    });

    it('gives the assistant the app tools behind QAzinho own MCP server', () => {
      expect(harness.assistant({ text: 'Oi', told: {}, app: APP }).tools).toEqual({
        groups: ['app'],
        allowedTools: ['mcp__qazinho'],
      });
    });
  });

  describe('build', () => {
    const BUILD = {
      platform: 'android' as const,
      dir: '/data/builds/work/b-1/src',
      repository: 'acme/loja-app',
      branch: 'main',
      commit: 'c0ffee1234567890',
      machine: {
        androidSdk: '/Users/qa/Library/Android/sdk',
        javaHome: '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
        hasXcode: true,
      },
      language: 'pt' as const,
    };

    it('briefs the builder, and nothing of a chat, a run or the assistant', async () => {
      const { systemPrompt, schema } = harness.build(BUILD);

      await expect(systemPrompt).toMatchFileSnapshot('./__prompts__/builder.txt');
      await expect(schema).toMatchFileSnapshot('./__prompts__/build-schema.txt');
      expect(systemPrompt.replace(/\s+/g, ' ')).toContain(
        'no idioma Brazilian Portuguese',
      );
      expect(systemPrompt).not.toContain('## Conversando com o QA');
      expect(systemPrompt).not.toContain('## Sendo o Estagiário');
    });

    it('asks for the build with the copy and the machine it runs on', async () => {
      await expect(harness.build(BUILD).prompt).toMatchFileSnapshot(
        './__prompts__/build-message.txt',
      );
    });

    it('lets the builder run build commands alone in its folder, and never delete or push', () => {
      const { tools, allowedTools, readDirs } = harness.build(BUILD);

      expect(tools).toEqual(['Bash', 'Read', 'Grep', 'Glob', 'Edit', 'Write']);
      expect(allowedTools).toContain('Bash(./gradlew:*)');
      expect(allowedTools).toContain('Bash(xcodebuild:*)');
      expect(allowedTools.some((tool) => /rm|git|curl/.test(tool))).toBe(false);
      expect(readDirs).toEqual(['/data/builds/work/b-1/src']);
    });
  });

  describe('review', () => {
    const REVIEW = {
      issue: {
        key: 'SHOP-57',
        title: 'Cupom expirado é aceito',
        url: 'https://acme.atlassian.net/browse/SHOP-57',
        status: 'Em revisão',
        isClosed: false,
        body: 'O total cai para R$ 90,00 com o cupom EXPIRED.',
        comments: [
          { author: 'Bia Dev', at: '2026-10-22', text: 'Acontece no mobile também?' },
        ],
      },
      bug: {
        title: 'Cupom expirado é aceito',
        expected: 'A mensagem "Este cupom expirou"',
        got: 'O total caiu para R$ 90,00',
        body: '',
        caseTitle: 'Um cupom expirado é recusado',
      },
      sightings: [
        {
          runId: 'r-05',
          runWhen: '14:02',
          caseId: 'TC-02',
          stepNumber: 2,
          action: 'Aplicar o cupom EXPIRED',
          note: 'O cupom foi aceito no celular.',
          target: 'Web · Chrome 390 × 844',
          shot: '/data/runs/w-1/r-05/step-2.jpg',
          requests: [],
        },
      ],
      readDirs: ['/data/runs/w-1'],
      language: 'pt' as const,
    };

    it('briefs the reporter, and nothing of a chat, a run or the assistant', async () => {
      const { systemPrompt, schema, readDirs } = harness.review(REVIEW);

      await expect(systemPrompt).toMatchFileSnapshot('./__prompts__/reporter.txt');
      await expect(schema).toMatchFileSnapshot('./__prompts__/review-schema.txt');
      expect(systemPrompt.replace(/\s+/g, ' ')).toContain(
        'no idioma Brazilian Portuguese',
      );
      expect(systemPrompt).not.toContain('## Conversando com o QA');
      expect(systemPrompt).not.toContain('## Sendo o Estagiário');
      expect(readDirs).toEqual(['/data/runs/w-1']);
    });

    it('asks about the issue with the bug and each time it came back', async () => {
      await expect(harness.review(REVIEW).prompt).toMatchFileSnapshot(
        './__prompts__/review-message.txt',
      );
    });

    it('reads the verdict the reporter answered with', () => {
      expect(
        harness.readReview(
          JSON.stringify({
            verdict: 'news',
            reason: 'No celular também.',
            comment: 'Também no celular.',
          }),
        ),
      ).toEqual({
        verdict: 'news',
        reason: 'No celular também.',
        comment: 'Também no celular.',
      });
    });
  });

  describe('readPull', () => {
    const PULL = {
      pull: {
        repository: 'loja/app',
        number: 482,
        title: 'Pix no checkout',
        body: 'Troca o botão do Pix.',
        headBranch: 'feat/checkout-pix',
        baseBranch: 'main',
      },
      files: [
        {
          path: 'src/checkout/PixPanel.tsx',
          status: 'modified',
          patch: '-<Button>Copiar código</Button>\n+<Button>Copiar Pix</Button>',
        },
      ],
      issue: null,
      plans: [
        {
          id: 'pl-1',
          name: 'Checkout com Pix',
          cases: [
            {
              id: 'case-1',
              title: 'Pagar com Pix',
              goal: '',
              steps: [
                { action: 'Clicar em "Copiar código"', expected: 'O código é copiado' },
              ],
            },
          ],
        },
      ],
      found: [
        {
          planId: 'pl-1',
          caseId: 'case-1',
          step: 1,
          text: 'Copiar código',
          replacement: 'Copiar Pix',
          file: 'src/checkout/PixPanel.tsx',
        },
      ],
      asked: [],
      language: 'pt' as const,
    };

    it('briefs the reader with no tools, and nothing of a chat, a run or the assistant', async () => {
      const { systemPrompt, schema } = harness.readPull(PULL);

      await expect(systemPrompt).toMatchFileSnapshot('./__prompts__/reader.txt');
      await expect(schema).toMatchFileSnapshot('./__prompts__/pull-schema.txt');
      expect(systemPrompt).toContain('## Lendo um pull request');
      expect(systemPrompt.replace(/\s+/g, ' ')).toContain(
        'no idioma Brazilian Portuguese',
      );
      expect(systemPrompt).not.toContain('## Conversando com o QA');
      expect(systemPrompt).not.toContain('## Sendo o Estagiário');
      expect(harness.toolsFor('reader').allowedTools).toEqual([]);
    });

    it('asks what the PR changes, with its files, the plans and what was found', async () => {
      await expect(harness.readPull(PULL).prompt).toMatchFileSnapshot(
        './__prompts__/pull-message.txt',
      );
    });

    it('hands the reader the cases the team asked for on the PR, one a line', async () => {
      await expect(
        harness.readPull({
          ...PULL,
          asked: [
            'cria um caso para desconto acima de R$ 100',
            'e outro para cupom vencido',
          ],
        }).prompt,
      ).toMatchFileSnapshot('./__prompts__/pull-asked-message.txt');
    });

    it('reads what the reader answered against the plans it read', () => {
      expect(
        harness.readPullAnswer({
          brief: PULL,
          text: JSON.stringify({
            breaks: [
              {
                planId: 'pl-1',
                caseId: 'case-1',
                step: 1,
                action: 'Clicar em "Copiar Pix"',
                expected: 'O código é copiado',
                why: 'O botão mudou de nome.',
                file: 'src/checkout/PixPanel.tsx',
              },
            ],
            reruns: [],
            newCases: [],
            risks: [],
          }),
        })?.breaks,
      ).toHaveLength(1);
    });
  });

  describe('change', () => {
    const CHANGE = {
      dir: '/data/suites/p-1/changes/c-01/work/e2e',
      config: 'playwright.config.ts',
      projects: ['chromium', 'salva-versao'],
      branch: 'qazinho/fix-ct-nav-002',
      base: 'main',
      commit: 'c0ffee1234567890',
      commits: ['fix(hc-1139): wait for the menu', 'feat(hc-1201): search by name'],
      task: {
        kind: 'fix' as const,
        broken: {
          title: 'CT-NAV-002 · Abre o carrinho pelo menu',
          file: 'tests/hc-1139/ct-nav.spec.ts',
          line: 13,
          project: 'chromium',
          path: ['CT-NAV · Navegação'],
          error:
            "TimeoutError: locator.click: Timeout 2000ms exceeded.\nCall log:\n  - waiting for getByRole('link', { name: 'Meu carrinho' })",
          notes:
            '# Page snapshot\n\n```yaml\n- banner:\n  - link "Carrinho 0":\n    - /url: /carrinho\n```',
          screenshots: [
            '/data/suites/p-1/runs/s-03/output/1/ct-nav-002/test-failed-1.png',
          ],
        },
      },
      readDirs: [
        '/data/suites/p-1/changes/c-01/work',
        '/data/suites/p-1/changes/c-01/checks',
        '/data/suites/p-1/runs/s-03',
      ],
      language: 'pt' as const,
    };

    it('briefs the automator, and nothing of a chat, a run, the assistant or a build', async () => {
      const { systemPrompt, schema } = harness.change(CHANGE);

      await expect(systemPrompt).toMatchFileSnapshot('./__prompts__/automator.txt');
      await expect(schema).toMatchFileSnapshot('./__prompts__/change-schema.txt');
      expect(systemPrompt.replace(/\s+/g, ' ')).toContain(
        'no idioma Brazilian Portuguese',
      );
      expect(systemPrompt).not.toContain('## Conversando com o QA');
      expect(systemPrompt).not.toContain('## Sendo o Estagiário');
      expect(systemPrompt).not.toContain('## Construindo o app');
    });

    it('asks for the fix with the suite, the test that broke and how it failed', async () => {
      await expect(harness.change(CHANGE).prompt).toMatchFileSnapshot(
        './__prompts__/change-message.txt',
      );
    });

    /**
     * Os testes rodam pelo QAzinho, que conhece os segredos que o agente nunca vê: o
     * agente não recebe shell nenhum.
     */
    it('asks for a new test with the QA words, the plan case and where to put it', async () => {
      await expect(
        harness.change({
          ...CHANGE,
          branch: 'qazinho/test-cart-survives-a-reload',
          task: {
            kind: 'write',
            wanted: {
              text: 'O carrinho mantém os itens depois de recarregar a página.',
              folder: 'tests/hc-1139',
              source: {
                workspace: 'Regressão do checkout',
                id: 'TC-03',
                title: 'O carrinho sobrevive a um reload',
                goal: 'Um item adicionado continua no carrinho.',
                preconditions: 'Um produto no carrinho.',
                steps: [
                  { action: 'Abrir o carrinho.', expected: 'Ele lista o produto.' },
                  {
                    action: 'Recarregar a página.',
                    expected: 'Ele ainda lista o produto.',
                  },
                ],
              },
            },
          },
        }).prompt,
      ).toMatchFileSnapshot('./__prompts__/write-message.txt');
    });

    it('lets the automator read and edit its folders and run tests through QAzinho, with no shell', () => {
      const { tools, allowedTools, readDirs } = harness.change(CHANGE);

      expect(tools).toEqual(['Read', 'Grep', 'Glob', 'Edit', 'Write']);
      expect(allowedTools).toEqual([
        'Read',
        'Grep',
        'Glob',
        'Edit',
        'Write',
        'mcp__qazinho',
      ]);
      expect(readDirs).toEqual(CHANGE.readDirs);
    });

    it('does NOT tell a builder or a runner how to change a suite', () => {
      expect(
        harness.build({
          platform: 'android',
          dir: '/b',
          repository: 'a/b',
          branch: 'main',
          commit: 'c0ffee1',
          machine: { androidSdk: null, javaHome: null, hasXcode: false },
          language: 'en',
        }).systemPrompt,
      ).not.toContain('## Mudando a suíte do time');
    });
  });

  describe('toolsFor', () => {
    it('gives the runner the device, behind QAzinho own MCP server', () => {
      expect(harness.toolsFor('runner')).toEqual({
        groups: ['device'],
        allowedTools: ['mcp__qazinho'],
      });
    });
  });

  describe('the device tools', () => {
    /**
     * Listadas do jeito que o agente as lista: um cliente MCP sobre um canal em memória,
     * sem rede.
     */
    it('lists them to the agent exactly as pinned', async () => {
      const mcp = new McpServer({ name: 'qazinho', version: '0' });
      const client = new Client({ name: 'pin', version: '0' });
      const [ours, theirs] = InMemoryTransport.createLinkedPair();

      registerDeviceTools({
        mcp,
        purpose: 'walk',
        call: () => Promise.reject(new Error('not called')),
      });
      await mcp.connect(ours);
      await client.connect(theirs);

      const { tools } = await client.listTools();

      await expect(JSON.stringify(tools, null, 2)).toMatchFileSnapshot(
        './__prompts__/device-tools.txt',
      );
      await client.close();
    });

    it('lists the explorer its own, exactly as pinned', async () => {
      const mcp = new McpServer({ name: 'qazinho', version: '0' });
      const client = new Client({ name: 'pin', version: '0' });
      const [ours, theirs] = InMemoryTransport.createLinkedPair();

      registerDeviceTools({
        mcp,
        purpose: 'explore',
        call: () => Promise.reject(new Error('not called')),
      });
      await mcp.connect(ours);
      await client.connect(theirs);

      const { tools } = await client.listTools();

      await expect(JSON.stringify(tools, null, 2)).toMatchFileSnapshot(
        './__prompts__/explore-tools.txt',
      );
      await client.close();
    });
  });

  describe('the suite tools', () => {
    /**
     * Listadas do jeito que o automator as lista: um cliente MCP sobre um canal em
     * memória, sem rede.
     */
    it('lists them to the agent exactly as pinned', async () => {
      const mcp = new McpServer({ name: 'qazinho', version: '0' });
      const client = new Client({ name: 'pin', version: '0' });
      const [ours, theirs] = InMemoryTransport.createLinkedPair();

      registerSuiteTools({ mcp, call: () => Promise.reject(new Error('not called')) });
      await mcp.connect(ours);
      await client.connect(theirs);

      const { tools } = await client.listTools();

      await expect(JSON.stringify(tools, null, 2)).toMatchFileSnapshot(
        './__prompts__/suite-tools.txt',
      );
      await client.close();
    });
  });

  describe('the source tools', () => {
    /**
     * Listadas do jeito que o chat as lista: um cliente MCP sobre um canal em memória,
     * sem rede.
     */
    it('lists them to the agent exactly as pinned', async () => {
      const mcp = new McpServer({ name: 'qazinho', version: '0' });
      const client = new Client({ name: 'pin', version: '0' });
      const [ours, theirs] = InMemoryTransport.createLinkedPair();

      registerSourceTools({ mcp, call: () => Promise.reject(new Error('not called')) });
      await mcp.connect(ours);
      await client.connect(theirs);

      const { tools } = await client.listTools();

      await expect(JSON.stringify(tools, null, 2)).toMatchFileSnapshot(
        './__prompts__/source-tools.txt',
      );
      await client.close();
    });
  });

  describe('the app tools', () => {
    /**
     * Listadas do jeito que o assistente as lista: um cliente MCP sobre um canal em
     * memória, sem rede.
     */
    it('lists them to the agent exactly as pinned', async () => {
      const mcp = new McpServer({ name: 'qazinho', version: '0' });
      const client = new Client({ name: 'pin', version: '0' });
      const [ours, theirs] = InMemoryTransport.createLinkedPair();

      registerAppTools({ mcp, call: () => Promise.reject(new Error('not called')) });
      await mcp.connect(ours);
      await client.connect(theirs);

      const { tools } = await client.listTools();

      await expect(JSON.stringify(tools, null, 2)).toMatchFileSnapshot(
        './__prompts__/app-tools.txt',
      );
      await client.close();
    });
  });
});
