# QAzinho harness

The QA harness QAzinho builds around an agent: what the agent is told, the tools it gets and the
shape it answers in. The desktop app and QAzinho Pro's API both run it.

```ts
import { Harness, McpHost } from '@salve-software/qazinho-harness';
import type { AppToolCall } from '@salve-software/qazinho-harness/contract';

const harness = new Harness();
const chat = harness.chat({ … });
```

## In a host

Add it as a git submodule and a `file:` dependency, and build it before the host builds:

```bash
git submodule add https://github.com/Salve-Software/qazinho-harness.git packages/qazinho-harness
```

```json
{
  "scripts": {
    "harness:build": "npm --prefix packages/qazinho-harness ci && npm --prefix packages/qazinho-harness run build"
  },
  "devDependencies": {
    "@salve-software/qazinho-harness": "file:packages/qazinho-harness"
  }
}
```

The host provides `zod`, `yaml` and `@modelcontextprotocol/sdk`.

## Development

Requires Node 22.12 or newer.

```bash
npm install
npm test
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and `.claude/rules/` before opening a PR.

## License

Proprietary. © 2026 Salve Software. All rights reserved. See [LICENSE](LICENSE).
