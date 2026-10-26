# Architecture

The harness answers one question per channel, for a target `{ role, platform }`:

| Channel | Where                        | Becomes                                                   |
| ------- | ---------------------------- | --------------------------------------------------------- |
| context | `src/context/corpus/**/*.md` | the system prompt, through `--append-system-prompt`       |
| tools   | `src/tools/`                 | QAzinho's MCP server and the `--allowedTools` a role gets |
| schemas | `src/schemas/`               | the shape an answer must take, through `--json-schema`    |

`Harness` (`src/Harness.class.ts`) is the class every host goes through; `McpHost`
(`src/tools/McpHost.class.ts`) serves the tools on loopback.

```
src/
├── Harness.class.ts   ← chat, run, walk, explore, assistant, build, change, review
├── index.ts           ← the Node entry: Harness, McpHost, the tools, the contract
├── contract/          ← the pure entry: types and plain constants a host's other side shares
├── engine/            ← the `/engine` entry: the devices a run drives, for the desktop and the CI
├── context/           ← corpus/ of .md, and the library that reads and renders it
├── tools/             ← McpHost, servers/<group>/, the grants per role
├── schemas/           ← one zod schema per answer
├── library/           ← the answer readers, jsonSchemaOf
├── constants/  types/
└── __tests__/         ← Harness.test.ts and the pinned prompts
```

## The corpus

- **Prose in `.md`, one `## Title` section per file.** Where a file lives says who reads it:
  `universal/` every call, `role/<role>/` one role (`chat`, `runner`, `explorer`, `assistant`,
  `builder`, `automator`, `reporter`), `platform/<x>.md` one device.
- Layers go from the most stable to the least: universal, role, platform. The frontmatter's
  `order` sorts a layer, and is unique in it (`CORPUS.test.ts`).
- `parseCorpusFile` reads where a file applies from the part of its key after `corpus/`, with
  forward slashes, and its frontmatter with LF line endings. Prettier keeps every file LF.
- `{{app}}`, `{{viewport}}`, `{{language}}` and `{{minutes}}` are filled per call; a placeholder
  nothing fills throws.
- **The corpus is embedded at build time.** `CORPUS.ts` reads the files through Vite's
  `import.meta.glob(…, { query: '?raw', eager: true })`; Vite's library build turns each file
  into a string in `dist/index.js`, and Vitest runs the same transform. Nothing reads the disk
  at runtime, so a host may bundle the package or not.

## The tools

- **Granted per role** (`TOOL_GRANTS`). The runner and the explorer get the device, the assistant
  gets the app, the chat gets its sources, the automator gets the suite.
- **Each group is a server** under `tools/servers/<group>/`: its zod schemas (`*_TOOLS`), a
  `register*Tools` that puts them on an `McpServer`, a `read*ToolCall` that reads the arguments
  back, and a `call*Tool` that does the call through the host's port.
- **The ports the host fills:**

  | Port             | What the host gives                                           | Tools                     |
  | ---------------- | ------------------------------------------------------------- | ------------------------- |
  | `IAttachDevice`  | a workspace, an `IDevicePort` driver, and the run's callbacks | device (runner, explorer) |
  | `IAttachApp`     | a scope, and `perform(call: AppToolCall)`                     | app (assistant)           |
  | `IAttachSources` | a scope, and `fetch(call: SourceCall)`                        | sources (chat)            |
  | `IAttachSuite`   | a scope, and `runTests(call: ISuiteTestsCall)`                | suite (automator)         |

- `McpHost` serves every attached scope on `127.0.0.1` with a token per process, and answers the
  permission tool (`PERMISSION_TOOL`) beside each group. `mcpConfigFor(scope)` writes the config
  the agent's CLI reads; `mcpConfigWith` adds the QA's own servers, such as Figma's.
- **The agent asks the QA mid-run** through the device group's `ask_qa`; the call holds until the
  host answers through `onAsk`.

## The answers

- **Every shape the agent fills is one zod schema** in `src/schemas/`. `jsonSchemaOf` turns it
  into the JSON Schema the agent reads (`--json-schema`), dropping the `$schema` key, which makes
  Claude Code ignore a schema in silence.
- The `read*Answer` functions read what came back against the same schema, and say what broke a
  rule in words the agent can act on.

## The contract

`src/contract/` holds the types a host shares with its own other side, and two plain constants
(`VARIABLE_NAME` here, `FIGMA_MCP` with the tools). The desktop re-exports each type from its
`src/shared/types/` with one line, so its page and its main read one definition, the one the
zod schemas are held to.

- Nothing in `src/contract/` imports Node, zod or the MCP SDK: the desktop's page compiles it
  without Node's types.
- A type that only the harness reads stays in `src/types/` or beside its group.

## What a host does

- Builds `new Harness()` and `new McpHost()` once, starts the host (`start()`) when it is ready,
  and closes it on the way out.
- Hands the agent's CLI what a `Harness` method returns: the system prompt, the prompt, the
  schema, the allowed tools, the folders it may read, the permission tool.
- Fills the ports, and keeps every secret on its side.

## The engine

`src/engine/` is what walks a run on a device, apart from what the agent is told: the desktop and
the CI's runner machines drive the same code. It is its own entry, `/engine`, so a host that only
asks the agent (the API) never loads Playwright.

- **`devices/`** holds each device a run drives, behind `IDeviceDriver`: `WebDriver` drives Chrome
  over playwright-core, one profile per workspace, and notes each request the app makes;
  `AndroidDriver` drives an AVD through `adb` and `uiautomator`; `IosDriver` a simulator through
  `simctl` and idb. A phone records itself into the run's folder (`RUN_VIDEO_FILES`).
- A browser is recorded from its live frames. The desktop encodes them in a hidden window;
  a CI machine has none, so `FrameRecorder` hands them to the machine's ffmpeg at a steady rate,
  each frame held until the next, and the video keeps the wall clock.
- **`library/`** starts every child process the way each platform needs (`spawnCommand`,
  `execCommand`): an npm `.cmd` shim on Windows runs as what it points at, with no console window.
- **`walk/`** walks a plan's cases on one device (`PlanWalker`), each on the app opened anew, by
  the run's mode (`WalkMode`): a case whose recording still shows each step's proof is walked again
  with no agent (`recipeFor`, `proofHolds`); the rest go to the agent, which heals a recording that
  broke, and a case it passed with every proof becomes a recording (`recipeOf`).
  - The agent is a port (`ICaseAgent`): one turn per case, acting through the device tools'
    callbacks (`IAttachDevice`), so whatever reaches the model walks the same way.
  - A `${NAME}` is typed with its value and read back as its name (`variablePort`).
  - With no agent, or once the run spent all it may on the model, a case no recording holds is
    skipped and says why. A question for the QA ends its case skipped, since no one answers.
  - It tells its host each step it starts and settles, each bug filed beside one, each note and
    what each case cost (`WalkEvent`); the host keeps them.
- **`agents/`** holds the agents a walk can hand a case to. `GatewayAgent` is the CI's: a loop over
  Anthropic's Messages API (`@anthropic-ai/sdk`, an optional peer) that carries out each tool call
  on the device here, through `callDeviceTool`, and answers it with the screen.
  - It reaches the model through QAzinho's gateway: the machine's environment points the SDK at
    it, with the job's token as its key. A 402 means the run spent all it may (`capped`).
  - The system prompt and the device tools come first and stay the same, so every call caches
    the prefix (`cache_control`); a cancelled turn aborts the call in flight.
- `ClaudeCodeAgent` walks a case through the Claude Code of the computer it runs on, the device
  tools served to it by `McpHost` on loopback, with none of its built-in tools and none of the
  developer's hooks: a CI run on a developer's own computer, which never reaches the gateway.
- **`runner/`** walks a CI job on the machine QAzinho's API starts for it, keeping the protocol in
  the API's `docs/runner-protocol.md`. `src/runner.ts` is its entry, built as `dist/runner.js`:
  it reads the machine's environment (`runnerEnvOf`), opens the device the job names on its build,
  and hands `JobRunner` the agent the job calls for (`gateway`, `claude-code` or none).
  - `JobRunner` reads the job, records the device, walks each plan with `PlanWalker`, and sends
    each run with its screens, video and requests, the bugs it filed or saw again, and the
    recordings it made (`RunnerApi`). It beats while it goes and stops before its deadline.
  - A failure lands on the open bug it is, which takes a sighting and keeps what it says; the rest
    are filed new under the run's id (`filedBugsOf`).
- It never imports a host either: what differs between the desktop and a CI machine (scaling a
  screenshot down, where a profile lives) arrives through its constructor.
- `playwright-core` is an optional peer dependency: only a host that loads `/engine` needs it.
