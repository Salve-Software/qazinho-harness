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
  over playwright-core, one profile per workspace, and notes each request the app makes.
- It never imports a host either: what differs between the desktop and a CI machine (scaling a
  screenshot down, where a profile lives) arrives through its constructor.
- `playwright-core` is an optional peer dependency: only a host that loads `/engine` needs it.
