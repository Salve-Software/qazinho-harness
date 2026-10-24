# Tests

Vitest, in Node. `npm test` runs every test; nothing here starts a browser, a device or an
agent.

## What must have a test

- **Every function exported from `library/`**, with the cases that matter: the happy path, the
  path that must not happen, and the edge.
- **Every constant table**, at its edges (`TOOL_GRANTS`, `CORPUS`).
- **Every tool group**: its schemas read back what an agent sends, and refuse what breaks a rule
  with words the agent can act on.

## The prompts are pinned

`src/__tests__/Harness.test.ts` writes what the agent reads, for each role and platform, and the
tool lists each group serves, into `src/__tests__/__prompts__/` with `toMatchFileSnapshot`.

- A change to the corpus, a schema, a tool or a placeholder shows up there as a diff. Review it
  as a change to the product, then update it with `npx vitest -u`.
- The `*-tools.txt` and `*-schema.txt` pins come from zod and the MCP SDK. The devDependencies
  pin the exact versions the desktop ships, so a host and the pins agree.

## Rules

- **No module mocking.** Hand-written fakes over a port: a fake `IDevicePort`, a fake `perform`.
- **Test names describe behaviour**, not methods.
- **Tests do not use the network.**
