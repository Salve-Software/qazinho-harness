# Ferramentas

## Comandos

| Comando                           | O que faz                                                |
| --------------------------------- | -------------------------------------------------------- |
| `npm run build`                   | `dist/index.js`, `contract.js`, `engine.js`, `runner.js` |
| `npm run typecheck`               | `tsc` sobre o pacote                                     |
| `npm run typecheck:fast`          | o mesmo pelo `tsgo`                                      |
| `npm run lint` / `lint:fix`       | ESLint                                                   |
| `npm run format` / `format:check` | Prettier                                                 |
| `npm test` / `test:watch`         | Vitest                                                   |

## O build

- **O modo biblioteca do Vite** empacota `src/index.ts`, `src/contract/index.ts` e
  `src/engine/index.ts` em módulos ES para o Node 22, e embute o corpus. Os builtins do Node,
  `zod`, `yaml`, o SDK de MCP e o `playwright-core` ficam externos.
- **O `tsc` escreve as declarações** em `dist/types/` (`tsconfig.build.json`), e o `tsc-alias`
  troca `@/` por caminhos relativos, para que um host as resolva sem os aliases deste pacote.
- Um host empacota o pacote construído ou o carrega como está. Ele nunca compila o fonte.

## Dependências

- `zod`, `yaml` e `@modelcontextprotocol/sdk` são **peerDependencies**: o host entrega uma cópia
  só, e os schemas que o harness passa ao SDK de MCP vêm do zod que o SDK usa. O
  `playwright-core` é opcional, para um host que carrega `/engine`.
- As devDependencies fixam as versões que o desktop instala (zod 4.6.7, o SDK de MCP 1.30.0,
  yaml 2.9.1), para que os prompts fixados batam com o que um host serve. Suba-as junto com os
  hosts.

## Versões seguradas de propósito

| Segurada       | Porque                                       |
| -------------- | -------------------------------------------- |
| TypeScript 5.9 | o typescript-eslint aceita TypeScript `<6.1` |

## Prettier e ESLint

O Prettier é a única fonte de formatação; o ESLint não formata. As regras que sustentam a
estrutura: `max-params: 2`, `member-ordering`, `consistent-type-imports`, `import-x/order` com o
grupo `type` no topo, `../` proibido, o framework de um host proibido, e `no-restricted-syntax`
sobre `**/*.class.ts`.

## CI

`.github/workflows/ci.yml`, em todo PR e todo push na `main`: lint, typecheck, formatação, testes,
build.
