import { z } from 'zod';
import { textNamed } from '@/tools/library/textNamed';

export const APP_TOOLS = [
  {
    name: 'workspace_details',
    description:
      'Read one workspace in full: its project and target, every case of its plan with its steps, its runs, its bugs, and the questions its chat waits on the QA to answer.',
    input: z.object({
      workspace: textNamed({
        message: '"workspace_details" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'run_details',
    description:
      'Read one run of a workspace step by step: how each case and step went and why, what it cost, and the notes its agent left. Leave "run" out for the latest one.',
    input: z.object({
      workspace: textNamed({
        message: '"run_details" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      run: z.string().trim().describe('The run, by its id, such as r-03.').optional(),
    }),
  },
  {
    name: 'bug_details',
    description:
      'Read one bug of a workspace in full: what was expected and what showed, how to reproduce it, and the run, case and step it was caught on.',
    input: z.object({
      workspace: textNamed({
        message: '"bug_details" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      bug: textNamed({
        message: '"bug_details" needs "bug": its id, such as BUG-02.',
        description: 'The bug, by its id, such as BUG-02.',
      }),
    }),
  },
  {
    name: 'list_repositories',
    description:
      "List the QA's GitHub repositories with their default branch, to link one to a project. It works once GitHub is connected.",
    input: z.object({}),
  },
  {
    name: 'open_workspace',
    description:
      'Open a workspace on screen, on its chat, plan, runs or bugs. Name a run or a bug to open that one.',
    input: z.object({
      workspace: textNamed({
        message: '"open_workspace" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      tab: z
        .enum(['chat', 'plan', 'runs', 'bugs'], {
          error: '"tab" is chat, plan, runs or bugs.',
        })
        .optional(),
      run: z.string().trim().describe('A run to open, by its id.').optional(),
      bug: z.string().trim().describe('A bug to open, by its id.').optional(),
    }),
  },
  {
    name: 'open_project',
    description:
      "Open a project's settings on screen, where its name, targets and repositories are.",
    input: z.object({
      project: textNamed({
        message: '"open_project" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
    }),
  },
  {
    name: 'open_settings',
    description: "Open QAzinho's settings, on one of its sections.",
    input: z.object({
      section: z
        .enum(
          [
            'agents',
            'devices',
            'integrations',
            'mcps',
            'appearance',
            'storage',
            'shortcuts',
            'about',
          ],
          {
            error:
              '"section" is agents, devices, integrations, mcps, appearance, storage, shortcuts or about.',
          },
        )
        .optional(),
    }),
  },
  {
    name: 'go_home',
    description: "Close the workspace on screen and go back to QAzinho's home.",
    input: z.object({}),
  },
  {
    name: 'create_project',
    description:
      'Create a project: its name, and at least one target among a web address, the path of an Android .apk and the path of an iOS simulator .app. Name the GitHub repositories it is made of, as owner/name, to link them too.',
    input: z.object({
      name: textNamed({
        message: '"create_project" needs "name": what the QA calls the project.',
        description: 'What the QA calls the project.',
      }),
      web: z
        .string()
        .trim()
        .describe('The web address, such as https://shop.test.')
        .optional(),
      android: z
        .string()
        .trim()
        .describe("The path of the Android .apk on the QA's machine.")
        .optional(),
      ios: z
        .string()
        .trim()
        .describe("The path of the iOS simulator .app on the QA's machine.")
        .optional(),
      repositories: z
        .array(z.string().trim())
        .describe('GitHub repositories the app is made of, as owner/name.')
        .optional(),
    }),
  },
  {
    name: 'update_project',
    description:
      'Change a project: rename it, or set or replace a target. An empty text removes that target, unless a workspace tests on it.',
    input: z.object({
      project: textNamed({
        message: '"update_project" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      name: z.string().trim().describe('The new name.').optional(),
      web: z.string().trim().describe('The web address, or "" to remove it.').optional(),
      android: z
        .string()
        .trim()
        .describe('The path of the Android .apk, or "" to remove it.')
        .optional(),
      ios: z
        .string()
        .trim()
        .describe('The path of the iOS simulator .app, or "" to remove it.')
        .optional(),
    }),
  },
  {
    name: 'link_repository',
    description:
      "Link one of the QA's GitHub repositories to a project, as owner/name. Its changes are measured against its default branch, or the base you name.",
    input: z.object({
      project: textNamed({
        message: '"link_repository" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      repository: textNamed({
        message: '"link_repository" needs "repository": owner/name.',
        description: 'The repository, as owner/name.',
      }),
      base: z
        .string()
        .trim()
        .describe('The branch its changes are measured against.')
        .optional(),
    }),
  },
  {
    name: 'unlink_repository',
    description: 'Unlink a repository from a project.',
    input: z.object({
      project: textNamed({
        message: '"unlink_repository" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      repository: textNamed({
        message: '"unlink_repository" needs "repository": owner/name.',
        description: 'The repository, as owner/name.',
      }),
    }),
  },
  {
    name: 'create_workspace',
    description:
      'Create a workspace in a project and open it on its chat: its name, and the target it tests on when the project has more than one.',
    input: z.object({
      project: textNamed({
        message: '"create_workspace" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      name: textNamed({
        message: '"create_workspace" needs "name": what the QA will test in it.',
        description: 'What the QA will test in it.',
      }),
      target: z
        .enum(['web', 'android', 'ios'], { error: '"target" is web, android or ios.' })
        .optional(),
    }),
  },
  {
    name: 'rename_workspace',
    description: 'Rename a workspace.',
    input: z.object({
      workspace: textNamed({
        message: '"rename_workspace" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      name: textNamed({
        message: '"rename_workspace" needs "name": the new name.',
        description: 'The new name.',
      }),
    }),
  },
  {
    name: 'link_design',
    description:
      "Check a workspace against a Figma design, as the QA does with /figma: the link to a frame or page in Figma. Its chat and its runs read the design through the QA's own Figma, and each step that lands on a designed screen is held to its frame.",
    input: z.object({
      workspace: textNamed({
        message: '"link_design" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      link: textNamed({
        message: '"link_design" needs "link": the link to a frame or page in Figma.',
        description:
          'The link to a frame or page in Figma, such as https://www.figma.com/design/AbC123/Shop?node-id=12-345.',
      }),
    }),
  },
  {
    name: 'unlink_design',
    description:
      'Stop checking a workspace against its Figma design. Its plan keeps the frames its steps name, for a design linked again.',
    input: z.object({
      workspace: textNamed({
        message: '"unlink_design" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'run_plan',
    description:
      "Run a workspace's whole plan on its device, as the QA's Run button does, and open it so they watch. This answers once the run started; it goes on by itself.",
    input: z.object({
      workspace: textNamed({
        message: '"run_plan" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'explore_app',
    description:
      "Explore a workspace's app with the QA's agent, with no plan, as the QA's Explore button does, and open it so they watch: for some minutes the agent goes through the app on its own, notes each screen, files what is broken, and leaves a suggested plan in the workspace's chat. This answers once it started; it goes on by itself.",
    input: z.object({
      workspace: textNamed({
        message: '"explore_app" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'ask_workspace_chat',
    description:
      "Send a message to a workspace's own chat in the QA's name, and open it there: its agent answers in that chat, as when the QA types there. Use it when the QA wants a test plan written or changed.",
    input: z.object({
      workspace: textNamed({
        message: '"ask_workspace_chat" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      text: textNamed({
        message: '"ask_workspace_chat" needs "text": the message for its agent.',
        description: "The message, as the QA would write it there, in the QA's language.",
      }),
      story: z
        .string({ error: '"story" is the key of a Jira story, such as SHOP-12.' })
        .trim()
        .toUpperCase()
        .regex(/^[A-Z][A-Z0-9_]*-\d+$/, {
          error: '"story" is the key of a Jira story, such as SHOP-12.',
        })
        .describe(
          'When the QA wants the plan made from a Jira story: its key, such as SHOP-12. QAzinho reads the story, its acceptance criteria and its files for that chat.',
        )
        .optional(),
      confluence: z
        .string({ error: '"confluence" is the title of a Confluence page, or its link.' })
        .trim()
        .min(1, { error: '"confluence" is the title of a Confluence page, or its link.' })
        .describe(
          'When the QA wants the plan made from a Confluence page: its title, as the QA named it, or its link. QAzinho finds the page and hands its text to that chat.',
        )
        .optional(),
      figma: z
        .string({ error: '"figma" is the link to a frame or page in Figma.' })
        .trim()
        .describe(
          "When the QA wants the plan checked against a Figma design: the link to a frame or page. The workspace keeps it, and its chat reads it through the QA's own Figma.",
        )
        .optional(),
    }),
  },
  {
    name: 'send_bug',
    description:
      "Send one bug of a workspace to the QA's tracker as an issue. Jira gets its steps, what was expected and what showed, its screens, a clip of the moment and a link to the story the plan came from; GitHub gets its words. Leave the place out to send it where the project's last bug went, else to the Jira project of the story the workspace works from, else to the project's first repository. The QA confirms it on screen, and this answers with the issue it became.",
    input: z.object({
      workspace: textNamed({
        message: '"send_bug" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      bug: textNamed({
        message: '"send_bug" needs "bug": its id, such as BUG-02.',
        description: 'The bug, by its id, such as BUG-02.',
      }),
      tracker: z
        .enum(['jira', 'github'], { error: '"tracker" is jira or github.' })
        .describe('The tracker it goes to, when the QA said which.')
        .optional(),
      project: z
        .string({ error: '"project" is the key of a Jira project, such as SHOP.' })
        .trim()
        .toUpperCase()
        .regex(/^[A-Z][A-Z0-9_]*$/, {
          error: '"project" is the key of a Jira project, such as SHOP.',
        })
        .describe('The Jira project it goes to, by its key, such as SHOP.')
        .optional(),
      repository: z
        .string({ error: '"repository" is a GitHub repository, as owner/name.' })
        .trim()
        .regex(/^[\w.-]+\/[\w.-]+$/, {
          error: '"repository" is a GitHub repository, as owner/name.',
        })
        .describe('The GitHub repository it goes to, as owner/name.')
        .optional(),
    }),
  },
  {
    name: 'dismiss_bug',
    description:
      'Say a bug of a workspace is no bug, as the QA does with Not a bug on its card: it leaves the open bugs, and no run hears of it again. With reopen, a bug the QA had said is none is open again. Do it only when the QA said so.',
    input: z.object({
      workspace: textNamed({
        message: '"dismiss_bug" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
      bug: textNamed({
        message: '"dismiss_bug" needs "bug": its id, such as BUG-02.',
        description: 'The bug, by its id, such as BUG-02.',
      }),
      reopen: z
        .boolean({ error: '"reopen" is true or false.' })
        .describe('True to open again a bug the QA had said is none.')
        .optional(),
    }),
  },
  {
    name: 'stop_run',
    description: 'Stop the run going on in a workspace.',
    input: z.object({
      workspace: textNamed({
        message: '"stop_run" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'change_settings',
    description:
      'Change how QAzinho looks and calls the QA back: the theme, the language, and how a finished run calls them.',
    input: z.object({
      theme: z
        .enum(['night', 'paper'], { error: '"theme" is night or paper.' })
        .describe('night is dark, paper is light.')
        .optional(),
      language: z
        .enum(['en', 'pt'], { error: '"language" is en or pt.' })
        .describe('en for English, pt for Brazilian Portuguese.')
        .optional(),
      runAlert: z
        .enum(['system', 'app'], { error: '"runAlert" is system or app.' })
        .describe(
          'system: a notification with sound and a count on the icon when the QA is away; app: a notice inside QAzinho only.',
        )
        .optional(),
    }),
  },
  {
    name: 'connect_integration',
    description:
      "Start connecting GitHub or Jira: QAzinho opens it in Settings. GitHub signs in through the QA's browser, and the QA types Jira's token there.",
    input: z.object({
      integration: z.enum(['github', 'jira'], {
        error: '"integration" is github or jira.',
      }),
    }),
  },
  {
    name: 'disconnect_integration',
    description:
      'Disconnect GitHub or Jira from QAzinho. The QA confirms it on screen, and this answers with what they chose.',
    input: z.object({
      integration: z.enum(['github', 'jira'], {
        error: '"integration" is github or jira.',
      }),
    }),
  },
  {
    name: 'build_app',
    description:
      "Build the app of a project from one of its GitHub repositories, with the QA's own agent: an Android .apk, or an iOS .app for the simulator. Once built, it becomes the project's target on that platform. It takes minutes and goes on by itself: this answers once it started, and build_status says how it goes.",
    input: z.object({
      project: textNamed({
        message: '"build_app" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      platform: z.enum(['android', 'ios'], { error: '"platform" is android or ios.' }),
      repository: z
        .string()
        .trim()
        .describe(
          "One of the project's repositories, as owner/name; its only one when left out.",
        )
        .optional(),
      branch: z
        .string()
        .trim()
        .describe("The branch to build; the repository's base branch when left out.")
        .optional(),
    }),
  },
  {
    name: 'build_status',
    description:
      'Read how the builds started since QAzinho opened went, or are going: what each builds, how far it got, and what it made or why it made nothing.',
    input: z.object({
      project: z
        .string()
        .trim()
        .describe("Only this project's builds, by its id or its name.")
        .optional(),
    }),
  },
  {
    name: 'ask_variables',
    description:
      "Ask the QA to type the values of a project's variables in a window QAzinho opens: an account, a password or a token a plan needs, new or with a value that changes. You never see a value: this answers with the names they kept, once they saved or closed the window.",
    input: z.object({
      project: textNamed({
        message: '"ask_variables" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      variables: z
        .array(
          z.object({
            name: textNamed({
              message:
                '"ask_variables" needs each variable\'s "name", such as LOGIN_EMAIL.',
              description: 'In capitals with _ between words, such as LOGIN_EMAIL.',
            }),
            description: z
              .string({ error: '"ask_variables" needs each variable\'s "description".' })
              .trim()
              .describe('What it holds, such as "The admin\'s email on staging".'),
          }),
          {
            error:
              '"ask_variables" needs "variables": the names and descriptions to ask for.',
          },
        )
        .min(1, { error: '"ask_variables" needs at least one variable.' })
        .max(10, { error: '"ask_variables" takes ten variables at most.' }),
    }),
  },
  {
    name: 'update_variable',
    description:
      "Rename one of a project's variables or change what it says it holds. Its value stays, and the plans that name it follow a new name; to change a value, use ask_variables.",
    input: z.object({
      project: textNamed({
        message: '"update_variable" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      variable: textNamed({
        message: '"update_variable" needs "variable": its name, such as LOGIN_EMAIL.',
        description: 'The variable, by its name.',
      }),
      name: z.string().trim().describe('The new name, in capitals with _.').optional(),
      description: z.string().trim().describe('What it holds now.').optional(),
    }),
  },
  {
    name: 'delete_variable',
    description:
      "Delete one of a project's variables, with its value. The QA confirms it on screen, and this answers with what they chose.",
    input: z.object({
      project: textNamed({
        message: '"delete_variable" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
      variable: textNamed({
        message: '"delete_variable" needs "variable": its name, such as LOGIN_EMAIL.',
        description: 'The variable, by its name.',
      }),
    }),
  },
  {
    name: 'delete_workspace',
    description:
      'Delete a workspace with its chat, plan, runs and bugs. The QA confirms it on screen, and this answers with what they chose.',
    input: z.object({
      workspace: textNamed({
        message: '"delete_workspace" needs "workspace": its id or its name.',
        description: 'The workspace, by its id or its name.',
      }),
    }),
  },
  {
    name: 'delete_project',
    description:
      'Delete a project with every workspace in it. The QA confirms it on screen, and this answers with what they chose.',
    input: z.object({
      project: textNamed({
        message: '"delete_project" needs "project": its id or its name.',
        description: 'The project, by its id or its name.',
      }),
    }),
  },
] as const;
