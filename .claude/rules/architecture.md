# Arquitetura

O harness responde uma pergunta por canal, para um alvo `{ role, platform }`:

| Canal   | Onde                         | Vira                                                         |
| ------- | ---------------------------- | ------------------------------------------------------------ |
| context | `src/context/corpus/**/*.md` | o system prompt, pelo `--append-system-prompt`               |
| tools   | `src/tools/`                 | o servidor MCP do QAzinho e o `--allowedTools` de cada papel |
| schemas | `src/schemas/`               | o formato que uma resposta precisa ter, pelo `--json-schema` |

`Harness` (`src/Harness.class.ts`) é a classe pela qual todo host passa; `McpHost`
(`src/tools/McpHost.class.ts`) serve as ferramentas no loopback.

```
src/
├── Harness.class.ts   ← chat, run, walk, explore, assistant, build, review
├── index.ts           ← a entrada de Node: Harness, McpHost, as ferramentas, o contrato
├── contract/          ← a entrada pura: tipos e constantes simples que o outro lado de um host divide
├── engine/            ← a entrada `/engine`: os dispositivos que uma run dirige, para o desktop e o CI
├── context/           ← corpus/ de .md, e a biblioteca que o lê e o monta
├── tools/             ← McpHost, servers/<group>/, as permissões por papel
├── schemas/           ← um schema zod por resposta
├── library/           ← os leitores de resposta, jsonSchemaOf
├── constants/  types/
└── __tests__/         ← Harness.test.ts e os prompts fixados
```

## O corpus

- **Prosa em `.md`, em português do Brasil, uma seção `## Título` por arquivo.** Onde um arquivo
  mora diz quem o lê: `universal/` toda chamada, `role/<role>/` um papel (`chat`, `runner`,
  `explorer`, `assistant`, `builder`, `reporter`), `platform/<x>.md` um dispositivo.
  Nomes de ferramentas, campos de schema e trechos de código seguem em inglês, como o código.
- As camadas vão da mais estável à menos: universal, papel, plataforma. O `order` do frontmatter
  ordena uma camada, e é único nela (`CORPUS.test.ts`).
- `parseCorpusFile` lê onde um arquivo se aplica a partir da parte da chave depois de `corpus/`,
  com barras normais, e o frontmatter com finais de linha LF. O Prettier mantém todo arquivo em LF.
- `{{app}}`, `{{viewport}}`, `{{language}}` e `{{minutes}}` são preenchidos a cada chamada; um
  placeholder que nada preenche lança erro.
- **O corpus é embutido na hora do build.** O `CORPUS.ts` lê os arquivos pelo
  `import.meta.glob(…, { query: '?raw', eager: true })` do Vite; o build de biblioteca do Vite
  transforma cada arquivo numa string em `dist/index.js`, e o Vitest roda a mesma transformação.
  Nada lê o disco na hora de rodar, então um host pode empacotar o pacote ou não.

## As ferramentas

- **Liberadas por papel** (`TOOL_GRANTS`). O runner e o explorer recebem o dispositivo, o
  assistente recebe o app, o chat recebe as fontes dele.
- **Cada grupo é um servidor** em `tools/servers/<group>/`: os schemas zod (`*_TOOLS`), um
  `register*Tools` que os coloca num `McpServer`, um `read*ToolCall` que lê os argumentos de volta,
  e um `call*Tool` que faz a chamada pela porta do host.
- **As portas que o host preenche:**

  | Porta            | O que o host entrega                                        | Ferramentas               |
  | ---------------- | ----------------------------------------------------------- | ------------------------- |
  | `IAttachDevice`  | um workspace, um driver `IDevicePort` e os callbacks da run | device (runner, explorer) |
  | `IAttachApp`     | um escopo, e `perform(call: AppToolCall)`                   | app (assistente)          |
  | `IAttachSources` | um escopo, e `fetch(call: SourceCall)`                      | sources (chat)            |

- O `McpHost` serve todo escopo anexado em `127.0.0.1` com um token por processo, e responde a
  ferramenta de permissão (`PERMISSION_TOOL`) ao lado de cada grupo. O `mcpConfigFor(scope)`
  escreve a config que a CLI do agente lê; o `mcpConfigWith` acrescenta os servidores do próprio
  QA, como o do Figma.
- **Um agente de fora chega pelo `OutsideHost`** (`src/tools/OutsideHost.class.ts`): o agente que o
  QA usa no próprio editor, e não um que o QAzinho inicia. O host entrega um endereço estável no
  loopback (a porta e o token vêm dele), serve só as ferramentas de `servers/outside/`, sem a
  de permissão, e não enfileira as chamadas, já que um `run_status` pode segurar por 50 segundos
  enquanto um `stop_run` chega. Um pedido com um `Origin` ou um `Host` que não sejam desta máquina é
  recusado (`isLocalRequest`). A resposta é dado do app testado, o que a descrição de cada
  ferramenta diz, e um valor de variável nunca passa por ela: o agente cadastra uma variável pelo nome e
  pela descrição, e o host abre a janela onde o usuário digita o valor.
- **O que o QA faz à mão no QAzinho tem uma ferramenta de fora; o que só a IA faz vai pela conversa**
  com o chat do workspace (`ask_workspace_chat`), como planejar a partir de uma história, de um design
  ou do código. As que mudam ou apagam mandam o agente perguntar ao usuário antes, com a ferramenta de
  perguntar dele.
- **O agente pergunta ao QA no meio da run** pelo `ask_qa` do grupo device; a chamada espera até o
  host responder pelo `onAsk`.
- **A run fala com o agente pelas respostas das ferramentas.** O `aside` do `IAttachDevice` é consultado
  a cada resposta do `callDeviceTool`, e o que devolver vai antes dela: o que o QA disse no meio da run
  e os lembretes de um passo que não anda. O agente conta o porquê com `say` e responde o QA com
  `answer_qa`; fora de uma run que os ouve, o `say` só responde.

## As respostas

- **Todo formato que o agente preenche é um schema zod** em `src/schemas/`. O `jsonSchemaOf` o
  transforma no JSON Schema que o agente lê (`--json-schema`), tirando a chave `$schema`, que faz o
  Claude Code ignorar um schema em silêncio.
- As funções `read*Answer` leem o que voltou contra o mesmo schema, e dizem o que quebrou uma
  regra com palavras com que o agente consegue agir.

## O contrato

`src/contract/` guarda os tipos que um host divide com o outro lado dele, e duas constantes simples
(`VARIABLE_NAME` aqui, `FIGMA_MCP` com as ferramentas). O desktop reexporta cada tipo do seu
`src/shared/types/` com uma linha, para que a página e o main dele leiam uma definição só, a mesma
a que os schemas zod se prendem.

- Nada em `src/contract/` importa Node, zod ou o SDK de MCP: a página do desktop o compila sem os
  tipos do Node.
- Um tipo que só o harness lê fica em `src/types/` ou ao lado do seu grupo.

## O que um host faz

- Constrói `new Harness()` e `new McpHost()` uma vez, inicia o host (`start()`) quando estiver
  pronto, e o fecha na saída.
- Entrega à CLI do agente o que um método do `Harness` devolve: o system prompt, o prompt, o
  schema, as ferramentas liberadas, as pastas que ele pode ler, a ferramenta de permissão.
- Preenche as portas, e guarda todo segredo do lado dele.

## O motor

`src/engine/` é o que anda uma run num dispositivo, à parte do que o agente ouve: o desktop e as
máquinas do runner do CI dirigem o mesmo código. É uma entrada própria, `/engine`, para que um
host que só pergunta ao agente (a API) nunca carregue o Playwright.

- **`devices/`** guarda cada dispositivo que uma run dirige, atrás de `IDeviceDriver`: o
  `WebDriver` dirige o Chrome pelo playwright-core, um perfil por workspace, anota cada
  requisição que o app faz e avisa o endereço da aba à vista a cada navegação (`onAddress`); o `AndroidDriver` dirige um AVD pelo `adb` e pelo `uiautomator`; o
  `IosDriver`, um simulador pelo `simctl` e pelo idb. Um celular grava a si mesmo na pasta da run
  (`RUN_VIDEO_FILES`).
- O Chrome abre sem copiar o próprio app (`CHROME_DISABLED_FEATURES`): no macOS, a cópia feita
  debaixo do QAzinho pedia a permissão de gerenciar apps, e o sistema avisava que o QAzinho tentou
  mudar outro app. O nosso `--disable-features` substitui o do Playwright, então repete a lista dele.
- Um navegador é gravado pelos frames ao vivo. O desktop os codifica numa janela escondida; uma
  máquina do CI não tem nenhuma, então o `FrameRecorder` os entrega ao ffmpeg da máquina num ritmo
  constante, cada frame mantido até o próximo, e o vídeo guarda o tempo de relógio.
- **`library/`** inicia todo processo filho do jeito que cada plataforma pede (`spawnCommand`,
  `execCommand`): um shim `.cmd` do npm no Windows roda como aquilo para que aponta, sem janela de
  console.
- **`walk/`** anda os casos de um plano num dispositivo (`PlanWalker`), cada um no app aberto do
  zero, pelo modo da run (`WalkMode`): um caso cuja gravação ainda mostra a prova de cada passo é
  andado de novo sem agente (`recipeFor`, `proofHolds`); o resto vai para o agente, que conserta
  uma gravação que quebrou, e um caso que ele passou com todas as provas vira uma gravação
  (`recipeOf`).
  - O agente é uma porta (`ICaseAgent`): um turno por caso, agindo pelos callbacks das
    ferramentas do dispositivo (`IAttachDevice`), para que o que chegar ao modelo ande do mesmo
    jeito.
  - Um `${NAME}` é digitado com o seu valor e lido de volta como o seu nome (`variablePort`).
  - Sem agente, ou quando a run gastou tudo o que podia no modelo, um caso que nenhuma gravação
    cobre é pulado e diz por quê. Uma pergunta ao QA termina o caso como pulado, já que ninguém
    responde.
  - Ele avisa o host de cada passo que começa e termina, de cada bug aberto ao lado de um, de cada
    nota e do que cada caso custou (`WalkEvent`); o host os guarda.
- **`agents/`** guarda os agentes a que um walk pode entregar um caso. O `GatewayAgent` é o do CI:
  um loop sobre a Messages API da Anthropic (`@anthropic-ai/sdk`, um peer opcional) que executa
  cada chamada de ferramenta no dispositivo daqui, pelo `callDeviceTool`, e a responde com a tela.
  - Ele chega ao modelo pelo gateway do QAzinho: o ambiente da máquina aponta o SDK para ele, com
    o token do job como chave. Um 402 quer dizer que a run gastou tudo o que podia (`capped`).
  - O system prompt e as ferramentas do dispositivo vêm primeiro e não mudam, então toda chamada
    guarda o prefixo em cache (`cache_control`); um turno cancelado aborta a chamada em andamento.
- O `ClaudeCodeAgent` anda um caso pelo Claude Code do computador em que roda, com as ferramentas
  do dispositivo servidas pelo `McpHost` no loopback, sem nenhuma ferramenta embutida e sem os hooks
  do desenvolvedor: uma run do CI no computador de um desenvolvedor, que nunca chega ao gateway.
- **`runner/`** anda um job do CI na máquina que a API do QAzinho inicia para ele, seguindo o
  protocolo do `docs/runner-protocol.md` da API. O `src/runner.ts` é a entrada dele, construída
  como `dist/runner.js`: ele lê o ambiente da máquina (`runnerEnvOf`), abre o dispositivo que o job
  nomeia no build dele, e entrega ao `JobRunner` o agente que o job pede (`gateway`, `claude-code`
  ou nenhum).
  - O `JobRunner` lê o job, grava o dispositivo, anda cada plano com o `PlanWalker`, e manda cada
    run com as telas, o vídeo e as requisições, os bugs que abriu ou viu de novo, e as gravações
    que fez (`RunnerApi`). Ele dá sinal de vida enquanto anda e para antes do prazo.
  - Uma falha cai no bug aberto que ela é, que ganha um avistamento e guarda o que ele diz; o resto
    é aberto como novo com o id da run (`filedBugsOf`).
- Ele também nunca importa um host: o que muda entre o desktop e uma máquina do CI (diminuir uma
  captura de tela, onde mora um perfil) chega pelo construtor.
- O `playwright-core` é uma dependência peer opcional: só um host que carrega `/engine` precisa
  dele.
