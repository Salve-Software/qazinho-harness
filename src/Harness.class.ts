import type { ICorpusFile } from '@/context/types';
import type {
  IAppSnapshot,
  IChatAnswer,
  IChatReference,
  ICodeCopy,
  IDesignLink,
  IFlatStep,
  IConfluencePage,
  IImportSource,
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
  IHarnessTarget,
  IPullAnswer,
  IPullBrief,
  IReviewAnswer,
  IReviewBrief,
} from '@/types';
import {
  CODE_SECTION,
  DESIGN_SECTION,
  IMPORT_SECTION,
  LANGUAGE_NAMES,
  STORY_SECTION,
} from '@/constants';
import { CORPUS } from '@/context/constants';
import {
  changedSections,
  chatMessageOf,
  describeApp,
  describeBuild,
  describeCase,
  describeCode,
  describeImport,
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
  readChatAnswer,
  readPullAnswer,
  readReviewAnswer,
} from '@/library';
import { BUILD_SCHEMA, CHAT_SCHEMA, PULL_SCHEMA, REVIEW_SCHEMA } from '@/schemas';
import { BUILD_TOOLS, MCP_HOST, PERMISSION_TOOL, TOOL_GRANTS } from '@/tools/constants';
import { designAccessOf, toolsOfRole } from '@/tools/library';

/**
 * O harness de produto do QAzinho: o que o agente do QA ouve, e quais ferramentas do
 * QAzinho ele recebe.
 */
export class Harness {
  private readonly corpus: readonly ICorpusFile[];

  public constructor(corpus: readonly ICorpusFile[] = CORPUS) {
    this.corpus = corpus;
  }

  /**
   * O system prompt de um alvo: o corpus que ele lê, com os valores desta chamada
   * preenchidos.
   */
  public contextFor(props: {
    target: IHarnessTarget;
    values?: Record<string, string>;
  }): string {
    const sections = sectionsFor({ corpus: this.corpus, target: props.target });

    return renderSections(fillSections({ sections, values: props.values ?? {} }));
  }

  /**
   * As ferramentas que um papel pode chamar; um papel sem nenhuma roda com todas tiradas.
   */
  public toolsFor(role: HarnessRole): IHarnessTools {
    return toolsOfRole({ grants: TOOL_GRANTS, role, server: MCP_HOST.name });
  }

  /**
   * O servidor Figma do próprio QA e as ferramentas dele que leem, para uma chamada num
   * workspace com design.
   */
  public designAccess(design: IDesignLink | null): IDesignAccess {
    return designAccessOf(design);
  }

  /**
   * Uma mensagem do chat: o corpus como system prompt, o que o agente ainda não ouviu, e
   * o que ele pode ler ou abrir.
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
    source?: IImportSource | null;
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
        describeImport({
          source: props.source ?? null,
          wasTold: (props.told[IMPORT_SECTION.title] ?? '') !== '',
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
        ...(props.source == null ? [] : [props.source.dir]),
        ...(props.story?.files.some(({ path }) => path !== null) === true
          ? [props.story.root]
          : []),
      ],
      permissionTool: PERMISSION_TOOL.granted,
    };
  }

  /**
   * O que uma sessão de chat já leu quando o agente buscou uma story ou uma página por
   * conta própria, para a próxima mensagem não entregá-las de novo.
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
   * Uma mensagem ao assistente: o corpus como system prompt, as palavras do QA abertas
   * pelo que mudou na tela e no app, e as ferramentas do app.
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
   * Um build do app, por um agente próprio: o que construir e em que máquina, os comandos
   * que ele pode rodar sozinho, e a pasta em que trabalha.
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
   * Um olhar sobre um bug que voltou: a issue como o time a mantém, cada ocorrência e as
   * telas dela, só leitura.
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
   * Uma leitura de pull request por um agente sem ferramentas: o PR, as mudanças, a issue
   * que ele fecha e os planos.
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
   * O que o leitor respondeu, conferido contra o schema e os planos que leu; null quando
   * não é uma resposta.
   */
  public readPullAnswer(props: { text: string; brief: IPullBrief }): IPullAnswer | null {
    return readPullAnswer(props);
  }

  /**
   * A revisão a partir do que o agente imprimiu; null quando ele respondeu outra coisa.
   */
  public readReview(text: string): IReviewAnswer | null {
    return readReviewAnswer(text);
  }

  /** A resposta do build a partir do que o agente imprimiu. */
  public readBuild(text: string): IBuildAnswer {
    return readBuildAnswer(text);
  }

  /**
   * A resposta do chat a partir do que o agente imprimiu, conferida contra o schema
   * pedido.
   */
  public readChat(text: string): IChatAnswer | null {
    return readChatAnswer(text);
  }

  /**
   * O system prompt de uma run num dispositivo, no idioma que o QA lê; um navegador
   * também recebe o tamanho da janela.
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
   * O system prompt de uma exploração do app num dispositivo, sem plano: quanto tempo
   * dura, no idioma que o QA lê.
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
   * A mensagem que começa uma exploração: quanto tempo dura, as variáveis, o que o plano
   * já cobre, os bugs conhecidos e a tela em que começa.
   */
  public startExploring(props: {
    minutes: number;
    screen: string;
    variables: IVariableBrief[];
    known: IKnownBug[];
    design: IDesignLink | null;
    plan?: IFlatStep[];
  }): string {
    return describeExploration(props);
  }

  /**
   * A mensagem que começa o turno de um caso: o idioma do QA, as variáveis, as respostas
   * dadas e os bugs abertos.
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
