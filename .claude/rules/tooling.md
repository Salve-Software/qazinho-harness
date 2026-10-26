# Tooling

## Commands

| Command                           | What it does                                               |
| --------------------------------- | ---------------------------------------------------------- |
| `npm run build`                   | `dist/index.js`, `contract.js`, `engine.js` and their d.ts |
| `npm run typecheck`               | `tsc` over the package                                     |
| `npm run typecheck:fast`          | the same through `tsgo`                                    |
| `npm run lint` / `lint:fix`       | ESLint                                                     |
| `npm run format` / `format:check` | Prettier                                                   |
| `npm test` / `test:watch`         | Vitest                                                     |

## The build

- **Vite's library mode** bundles `src/index.ts`, `src/contract/index.ts` and
  `src/engine/index.ts` into ES modules for Node 22, and embeds the corpus. Node builtins, `zod`,
  `yaml`, the MCP SDK and `playwright-core` stay external.
- **`tsc` writes the declarations** into `dist/types/` (`tsconfig.build.json`), and `tsc-alias`
  rewrites `@/` into relative paths, so a host resolves them without this package's aliases.
- A host bundles the built package or loads it as it is. It never compiles the source.

## Dependencies

- `zod`, `yaml` and `@modelcontextprotocol/sdk` are **peerDependencies**: the host ships one copy,
  and the schemas the harness hands the MCP SDK come from the zod the SDK uses. `playwright-core`
  is an optional one, for a host that loads `/engine`.
- The devDependencies pin the versions the desktop installs (zod 4.6.7, the MCP SDK 1.30.0,
  yaml 2.9.1), so the pinned prompts match what a host serves. Lift them together with the
  hosts.

## Versions held back on purpose

| Held           | Because                                     |
| -------------- | ------------------------------------------- |
| TypeScript 5.9 | typescript-eslint accepts TypeScript `<6.1` |

## Prettier and ESLint

Prettier is the single source of formatting; ESLint does not format. The rules backing the
structure: `max-params: 2`, `member-ordering`, `consistent-type-imports`, `import-x/order` with
the `type` group on top, `../` banned, a host's framework banned, and `no-restricted-syntax` over
`**/*.class.ts`.

## CI

`.github/workflows/ci.yml`, on every PR and every push to `main`: lint, typecheck, format, test,
build.
