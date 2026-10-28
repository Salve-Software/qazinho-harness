# Comentários

**Nada de comentários no código.** Nem `//`, nem `/* */`, nem `{/* */}` no JSX, nem no CSS. O
código, os nomes e os testes dizem o que ele faz; a mensagem de commit diz por que ele mudou.

## JSDoc, e só aqui

O JSDoc é a única exceção, para que passar o mouse sobre um nome no editor o explique. Ele vai
**só** acima de:

| Onde                                      | Exemplo                                          |
| ----------------------------------------- | ------------------------------------------------ |
| Uma função num arquivo de `library/`      | `export function isInternalNavigation(...)`      |
| Um tipo num arquivo de `types/`           | `export interface IQazinhoApi`, `export type …`  |
| A declaração de uma classe, e cada método | `export class AgentRunner`, `public async ask()` |
| A declaração de um componente             | `export const Composer: React.FC<...>`           |

Em nenhum outro lugar: nem numa constante, num view model, num hook, numa store, numa função de
service, numa variável, numa regra de CSS, nem dentro do corpo de uma interface.

```ts
/** Se uma navegação fica dentro do app: mesma origem, ou a própria página empacotada. */
export function isInternalNavigation(appUrl: string, url: string): boolean {}
```

- **Em português do Brasil.** O JSDoc e os comentários dos testes são prosa, como os `.md`; o
  código que eles descrevem continua em inglês.
- **Nunca dentro de uma interface ou de um tipo.** Nada de JSDoc nem de comentário numa
  propriedade, na assinatura de um método ou num campo de um tipo literal: o que um membro
  significa vai no nome dele, ou no JSDoc do próprio tipo. O `qazinho/no-comment-in-type`
  reprova o lint num caso desses.
- **Duas linhas no máximo, cada uma dentro de 90 colunas.** Uma é melhor. Diga o que a coisa faz,
  direto, e pare: não tudo o que ela toca, nem por que ela existe. O `qazinho/short-jsdoc` reprova
  o lint num mais longo.
- Ele diz o que **aquela** coisa faz. Se continuar verdadeiro colado em outra coisa do mesmo tipo,
  não diz nada.
- Um bom nome dispensa JSDoc: deixe-o de fora em vez de repetir o nome.

## Os testes são a exceção

Em `__tests__/` e `tests/`, comentários e JSDoc são livres: um teste pode explicar a armadilha que
guarda, o fake que monta ou por que um caso existe.

## O que antes seria um comentário

Uma armadilha que viraria comentário (o Electron engolindo um clique numa região de arrasto, um
frame do CDP que pede um ack) vira um teste que falha quando alguém cai nela, um nome que a diz,
ou uma linha na mensagem de commit.
