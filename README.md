# Harness do QAzinho

O harness de QA que o QAzinho monta em volta de um agente: o que o agente ouve, as ferramentas que
ele recebe e o formato em que responde. O app desktop e a API do QAzinho Pro rodam ele.

```ts
import { Harness, McpHost } from '@ploomes/qazinho-harness';
import type { AppToolCall } from '@ploomes/qazinho-harness/contract';

const harness = new Harness();
const chat = harness.chat({ … });
```

## Num host

Adicione como submódulo git e dependência `file:`, e construa antes do build do host:

```bash
git submodule add https://github.com/Salve-Software/qazinho-harness.git packages/qazinho-harness
```

```json
{
  "scripts": {
    "harness:build": "npm --prefix packages/qazinho-harness ci && npm --prefix packages/qazinho-harness run build"
  },
  "devDependencies": {
    "@ploomes/qazinho-harness": "file:packages/qazinho-harness"
  }
}
```

O host fornece `zod`, `yaml` e `@modelcontextprotocol/sdk`.

## Desenvolvimento

Pede Node 22.12 ou mais novo.

```bash
npm install
npm test
npm run build
```

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) e o `.claude/rules/` antes de abrir um PR.

## Licença

Proprietária. © 2026 Salve Software. Todos os direitos reservados. Veja a [LICENSE](LICENSE).
