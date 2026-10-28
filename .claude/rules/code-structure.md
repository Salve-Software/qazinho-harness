# Estrutura do código

As mesmas regras do app desktop, aplicadas a um pacote sem árvore `classes/`.

## Uma classe fica na raiz da pasta que ela serve

`Harness.class.ts` em `src/`, `McpHost.class.ts` em `src/tools/`. Cada uma divide com a pasta o
`library/`, o `types/` e o `constants/`. Uma pasta de classe aqui só repetiria o nome da pasta em
volta.

## Nomes de arquivo

| Arquivo    | Padrão                     | Exemplo                                        |
| ---------- | -------------------------- | ---------------------------------------------- |
| Pasta      | `lowercase`, um grupo      | `src/tools/servers/device/`                    |
| Classe     | `<PascalCase>.class.ts`    | `McpHost.class.ts`                             |
| Biblioteca | `camelCase.ts`, uma função | `library/jsonSchemaOf.ts`                      |
| Constante  | `SCREAMING_SNAKE.ts`, uma  | `constants/TOOL_GRANTS.ts`                     |
| Tipo       | `<TypeName>.ts`, um tipo   | `types/IDevicePort.ts`                         |
| Corpus     | `kebab-case.md`, uma seção | `context/corpus/role/runner/walking-a-case.md` |
| Teste      | `__tests__/<name>.test.ts` | `library/__tests__/jsonSchemaOf.test.ts`       |

## Um arquivo guarda uma coisa

Um arquivo de classe guarda a classe, um de biblioteca uma função exportada, um de constante um
valor, um de tipo um tipo. Um helper que fica privado pode morar ao lado da sua única exportação.
Garantido pelo `no-restricted-syntax` sobre `**/*.class.ts`.

## Um arquivo de biblioteca abre com a sua exportação

A função exportada vem primeiro, depois dos imports e de qualquer tipo ou valor privado que ela
lê. As funções privadas que ela chama vêm depois, no fim do arquivo, para quem abre o arquivo ler
o que ele faz antes do como. O `no-restricted-syntax` sobre `library/` reprova um helper declarado
antes da exportação.

## Tipos

- Uma `interface` leva o prefixo `I`; um `type` não.
- Um barrel de `types/` reexporta com `export type *`, nunca `export *`.
- Um resultado com mais de uma forma é uma união discriminada.

## No máximo 2 parâmetros

Uma função, um método ou um construtor com mais de 2 parâmetros recebe um objeto (`max-params`).

## Ordem dentro de uma classe

campos → construtor → métodos públicos → métodos privados (`member-ordering`).

## Toda pasta de coisas tem um `index.ts`

Quem chama importa a pasta, nunca um arquivo dentro dela. Dentro do pacote, `@/` aponta para
`src/`; `../` é erro de lint. `import type` vem primeiro, numa declaração própria.
