import type { ICorpusFile } from '@/context/types';
import type {
  IAppSnapshot,
  IChatAnswer,
  IChatReference,
  ICodeCopy,
  IDesignLink,
  IFlatStep,
  IConfluencePage,
  IJiraStoryCopy,
  IKnownBug,
  ITargetUnderTest,
  IVariableBrief,
  IViewport,
  Language,
} from '@/contract';
import type { IDesignAccess, IHarnessTools } from '@/tools/types';
import type {
  AppLook,
  HarnessRole,
  IBuildAnswer,
  IBuildMachine,
  IChangeAnswer,
  IChangeBrief,
  IHarnessTarget,
  IPullAnswer,
  IPullBrief,
  IReviewAnswer,
  IReviewBrief,
} from '@/types';
import { CODE_SECTION, DESIGN_SECTION, LANGUAGE_NAMES, STORY_SECTION } from '@/constants';
import { CORPUS } from '@/context/constants';
import {
  changedSections,
  chatMessageOf,
  describeApp,
  describeBuild,
  describeCase,
  describeChange,
  describeCode,
  describeDesign,
  describeExploration,
  describeKeptVariables,
  describeLook,
  describePlan,
  describePull,
  describeReferences,
  describeReview,
  describeRuns,
  describeScreen,
  describeSize,
  describePage,
  describeStory,
  fillSections,
  renderSections,
  sectionsFor,
} from '@/context/library';
import {
  readBuildAnswer,
  readChangeAnswer,
  readChatAnswer,
  readPullAnswer,
  readReviewAnswer,
} from '@/library';
import {
  BUILD_SCHEMA,
  CHANGE_SCHEMA,
  CHAT_SCHEMA,
  PULL_SCHEMA,
  REVIEW_SCHEMA,
} from '@/schemas';
import {
  BUILD_TOOLS,
  CHANGE_TOOLS,
  MCP_HOST,
  PERMISSION_TOOL,
  TOOL_GRANTS,
} from '@/tools/constants';
import { designAccessOf, toolsOfRole } from '@/tools/library';

/**
 * QAzinho's product harness: what the QA's agent is told, and which of QAzinho's tools it
 * gets.
 */
export class Harness {
  private readonly corpus: readonly ICorpusFile[];

  public constructor(corpus: readonly ICorpusFile[] = CORPUS) {
    this.corpus = corpus;
  }

  /**
   * The system prompt for a target: the corpus it reads, with this call's values filled
   * in.
   */
  public contextFor(props: {
    target: IHarnessTarget;
    values?: Record<string, string>;
  }): string {
    const sections = sectionsFor({ corpus: this.corpus, target: props.target });

    return renderSections(fillSections({ sections, values: props.values ?? {} }));
  }

  /** The tools a role may call; a role with none runs with every tool taken away. */
  public toolsFor(role: HarnessRole): IHarnessTools {
    return toolsOfRole({ grants: TOOL_GRANTS, role, server: MCP_HOST.name });
  }

  /**
   * The QA's own Figma server and the tools of it that read, for a call on a workspace
   * with a design.
   */
  public designAccess(design: IDesignLink | null): IDesignAccess {
    return designAccessOf(design);
  }

  /**
   * One chat message: the corpus as system prompt, what the agent was not told yet, and
   * what it may read or open.
   */
  public chat(props: {
    text: string;
    told: Record<string, string>;
    target: ITargetUnderTest | null;
    viewport: IViewport | null;
    steps: IFlatStep[];
    references: IChatReference[];
    runs: IChatReference[];
    look: AppLook | null;
    code: ICodeCopy | null;
    story: IJiraStoryCopy | null;
    page: IConfluencePage | null;
    design: IDesignLink | null;
    variables: IVariableBrief[];
  }): {
    systemPrompt: string;
    prompt: string;
    told: Record<string, string>;
    schema: string;
    tools: IHarnessTools;
    design: IDesignAccess;
    readDirs: string[];
    permissionTool: string;
  } {
    const news = changedSections({
      sections: [
        {
          title: 'This workspace',
          lines: [
            props.target === null
              ? 'The workspace has no app to test yet.'
              : `The app under test is ${props.target.kind}: ${props.target.value}.`,
            ...describeSize(props.viewport),
            ...describePlan(props.steps),
          ],
        },
        describeKeptVariables(props.variables),
        describeRuns(props.runs),
        describeLook(props.look),
        describeCode({
          code: props.code,
          wasTold: (props.told[CODE_SECTION.title] ?? '') !== '',
        }),
        describeStory({
          story: props.story,
          wasTold: (props.told[STORY_SECTION.title] ?? '') !== '',
        }),
        describePage(props.page),
        describeDesign({
          design: props.design,
          wasTold: (props.told[DESIGN_SECTION.title] ?? '') !== '',
        }),
      ],
      told: props.told,
    });

    return {
      systemPrompt: this.contextFor({ target: { role: 'chat' } }),
      prompt: chatMessageOf({
        sections: [...news.changed, describeReferences(props.references)],
        text: props.text,
      }),
      told: news.told,
      schema: CHAT_SCHEMA,
      tools: this.toolsFor('chat'),
      design: designAccessOf(props.design),
      readDirs: [
        ...(props.code === null ? [] : [props.code.root]),
        ...(props.story?.files.some(({ path }) => path !== null) === true
          ? [props.story.root]
          : []),
      ],
      permissionTool: PERMISSION_TOOL.granted,
    };
  }

  /**
   * What a chat session has read once its agent fetched a story or a page on its own, so
   * the next message does not hand them over again.
   */
  public toldAfterReading(props: {
    told: Record<string, string>;
    story: IJiraStoryCopy | null;
    page: IConfluencePage | null;
  }): Record<string, string> {
    return changedSections({
      sections: [
        ...(props.story === null
          ? []
          : [describeStory({ story: props.story, wasTold: false })]),
        ...(props.page === null ? [] : [describePage(props.page)]),
      ],
      told: props.told,
    }).told;
  }

  /**
   * One message to the assistant: the corpus as its system prompt, the QA's words opened
   * by what changed on screen and in the app, and the app tools.
   */
  public assistant(props: {
    text: string;
    told: Record<string, string>;
    app: IAppSnapshot;
  }): {
    systemPrompt: string;
    prompt: string;
    told: Record<string, string>;
    tools: IHarnessTools;
  } {
    const news = changedSections({
      sections: [describeScreen(props.app), describeApp(props.app)],
      told: props.told,
    });

    return {
      systemPrompt: this.contextFor({ target: { role: 'assistant' } }),
      prompt: chatMessageOf({ sections: news.changed, text: props.text }),
      told: news.told,
      tools: this.toolsFor('assistant'),
    };
  }

  /**
   * One build of the app, by an agent of its own: what to build and on what machine, the
   * commands it may run alone, and the folder it works in.
   */
  public build(props: {
    platform: 'android' | 'ios';
    dir: string;
    repository: string;
    branch: string;
    commit: string;
    machine: IBuildMachine;
    language: Language;
  }): {
    systemPrompt: string;
    prompt: string;
    schema: string;
    tools: string[];
    allowedTools: string[];
    readDirs: string[];
  } {
    return {
      systemPrompt: this.contextFor({
        target: { role: 'builder' },
        values: { language: LANGUAGE_NAMES[props.language] },
      }),
      prompt: chatMessageOf({ sections: describeBuild(props), text: 'Build it.' }),
      schema: BUILD_SCHEMA,
      tools: [...BUILD_TOOLS.tools],
      allowedTools: [...BUILD_TOOLS.allowed],
      readDirs: [props.dir],
    };
  }

  /**
   * One change to the team's suite: its copy, the test to fix or write, the file tools
   * and the tool that runs tests.
   */
  public change(props: IChangeBrief): {
    systemPrompt: string;
    prompt: string;
    schema: string;
    tools: string[];
    allowedTools: string[];
    readDirs: string[];
  } {
    return {
      systemPrompt: this.contextFor({
        target: { role: 'automator' },
        values: { language: LANGUAGE_NAMES[props.language] },
      }),
      prompt: chatMessageOf({
        sections: describeChange(props),
        text:
          props.task.kind === 'fix'
            ? 'Fix this test, or show that the app is wrong.'
            : 'Write this test, or show that the app does not do it.',
      }),
      schema: CHANGE_SCHEMA,
      tools: [...CHANGE_TOOLS.tools],
      allowedTools: [...CHANGE_TOOLS.allowed, ...this.toolsFor('automator').allowedTools],
      readDirs: props.readDirs,
    };
  }

  /**
   * One look at a bug that came back: the issue as the team keeps it, each sighting and
   * its screens, read only.
   */
  public review(brief: IReviewBrief): {
    systemPrompt: string;
    prompt: string;
    schema: string;
    readDirs: string[];
  } {
    return {
      systemPrompt: this.contextFor({
        target: { role: 'reporter' },
        values: { language: LANGUAGE_NAMES[brief.language] },
      }),
      prompt: chatMessageOf({
        sections: describeReview(brief),
        text: 'Does the issue need an update?',
      }),
      schema: REVIEW_SCHEMA,
      readDirs: brief.readDirs,
    };
  }

  /**
   * One read of a pull request by a tool-less agent: the PR, its changes, the issue it
   * closes and the plans.
   */
  public readPull(brief: IPullBrief): {
    systemPrompt: string;
    prompt: string;
    schema: string;
  } {
    return {
      systemPrompt: this.contextFor({
        target: { role: 'reader' },
        values: { language: LANGUAGE_NAMES[brief.language] },
      }),
      prompt: chatMessageOf({
        sections: describePull(brief),
        text: 'What does this pull request change in the plans?',
      }),
      schema: PULL_SCHEMA,
    };
  }

  /**
   * What the reader answered, checked against its schema and the plans it read; null when
   * it is not an answer.
   */
  public readPullAnswer(props: { text: string; brief: IPullBrief }): IPullAnswer | null {
    return readPullAnswer(props);
  }

  /** The review out of what the agent printed; null when it answered something else. */
  public readReview(text: string): IReviewAnswer | null {
    return readReviewAnswer(text);
  }

  /** The change answer out of what the agent printed. */
  public readChange(text: string): IChangeAnswer {
    return readChangeAnswer(text);
  }

  /** The build answer out of what the agent printed. */
  public readBuild(text: string): IBuildAnswer {
    return readBuildAnswer(text);
  }

  /**
   * The chat answer out of what the agent printed, checked against the schema it was
   * asked for.
   */
  public readChat(text: string): IChatAnswer | null {
    return readChatAnswer(text);
  }

  /**
   * The system prompt of a run on one device, in the language the QA reads; a browser
   * also gets the window size.
   */
  public run(props: {
    target: ITargetUnderTest;
    viewport: IViewport;
    language: Language;
  }): string {
    return this.contextFor({
      target: { role: 'runner', platform: props.target.kind },
      values: {
        app: props.target.value,
        viewport: `${String(props.viewport.width)} × ${String(props.viewport.height)}`,
        language: LANGUAGE_NAMES[props.language],
      },
    });
  }

  /**
   * The system prompt of an exploration of the app on one device, with no plan: how long
   * it goes, in the language the QA reads.
   */
  public explore(props: {
    target: ITargetUnderTest;
    viewport: IViewport;
    language: Language;
    minutes: number;
  }): string {
    return this.contextFor({
      target: { role: 'explorer', platform: props.target.kind },
      values: {
        app: props.target.value,
        viewport: `${String(props.viewport.width)} × ${String(props.viewport.height)}`,
        language: LANGUAGE_NAMES[props.language],
        minutes: String(props.minutes),
      },
    });
  }

  /**
   * The message that starts an exploration: how long it goes, the variables it may type,
   * the bugs already open, and the screen it starts on.
   */
  public startExploring(props: {
    minutes: number;
    screen: string;
    variables: IVariableBrief[];
    known: IKnownBug[];
    design: IDesignLink | null;
  }): string {
    return describeExploration(props);
  }

  /**
   * The message that starts a case's turn: the QA's language, the variables, the answers
   * given and the open bugs.
   */
  public walk(props: {
    steps: IFlatStep[];
    screen: string;
    language: Language;
    filed: string[];
    known: IKnownBug[];
    variables: IVariableBrief[];
    design: IDesignLink | null;
    told?: { question: string; answer: string }[];
  }): string {
    return describeCase(props);
  }
}
