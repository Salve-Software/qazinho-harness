# Contributing

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

CI runs all of those.

## What a change to the harness means

What the agent reads is pinned in `src/__tests__/__prompts__/`. A change to the corpus, a schema
or a tool shows up there as a diff: review it as a change to the product, then update the pins
with `npx vitest -u`. Both hosts pick the change up when they move their submodule.

## Commits

[Conventional](https://www.conventionalcommits.org/) and small: `feat`, `fix`, `docs`, `test`,
`refactor`, `chore`, `ci`, `build`. Never mix unrelated changes.

## How the code is expected to look

`.claude/rules/` is the style guide: the harness's architecture, one thing per file, comments,
tests and tooling.
