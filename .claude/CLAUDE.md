# QAzinho harness

The QA harness QAzinho builds around an agent: what the agent is told, the tools it gets and the
shape it answers in. One package, read by two hosts:

| Host                                 | Where it runs              | What it runs the harness for                           |
| ------------------------------------ | -------------------------- | ------------------------------------------------------ |
| the desktop app (`gocrash`)          | Electron's main process    | the QA's own agent: chat, runs, builds, the Estagiário |
| QAzinho Pro's API (`qazinho-server`) | Node, on QAzinho's servers | QAzinho's agent: CI runs, reading a PR                 |

**The agent's CLI stays the engine.** The harness never spawns an agent, never holds a key and
never opens a window: the host does, with what the harness hands it (a system prompt, a JSON
Schema, the tools a role may call, an MCP config).

## The rules that are not up for negotiation

1. **The harness is a library, not a host.** No Electron, no Fastify, no database, no host's
   folder or path. What it needs from the outside world is a port in its types (`IDevicePort`,
   `IAttachApp`, `IAttachSources`, `IAttachSuite`), and the host fills it. ESLint refuses an
   import of a host's framework.
2. **Both hosts read the same words.** `src/__tests__/__prompts__/` pins what the agent reads for
   each role and platform; changing what the agent is told is a diff of those files, made on
   purpose.
3. **Every shape the agent fills is one zod schema**: an answer, or a tool's arguments. The same
   schema becomes the JSON Schema the agent reads and reads back what it sent.
4. **The contract stays pure.** `@salve-software/qazinho-harness/contract` holds the types and
   plain constants a host's other side shares (the desktop's page imports it): no Node, no zod,
   no MCP in there.
5. **A secret never reaches the agent.** It reads `${NAME}`; the host types the value.
6. **All code is in English**: names, strings, docs and commits.

## How a host takes it

A git submodule at `packages/qazinho-harness`, depended on with
`"@salve-software/qazinho-harness": "file:packages/qazinho-harness"`, and built once by the
host's `harness:build` script (`npm --prefix packages/qazinho-harness ci && … run build`), the
way Rotuz-server takes its engine. The host imports the built `dist/`, never the source: both
repositories map `@/` to their own `src/`.

## Mandatory rules

@rules/architecture.md
@rules/code-structure.md
@rules/comments.md
@rules/testing.md
@rules/tooling.md
