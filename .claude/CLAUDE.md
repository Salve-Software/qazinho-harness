# Harness do QAzinho

O harness de QA que o QAzinho monta em volta de um agente: o que o agente ouve, as ferramentas que
ele recebe e o formato em que responde. Um pacote só, lido por dois hosts:

| Host                                    | Onde roda                       | Para que roda o harness                                |
| --------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| o app desktop (`gocrash`)               | o processo main do Electron     | o agente do próprio QA: chat, runs, builds, Estagiário |
| a API do QAzinho Pro (`qazinho-server`) | Node, nos servidores do QAzinho | o agente do QAzinho: runs do CI, leitura de PR         |

**A CLI do agente continua sendo o motor.** O harness nunca inicia um agente, nunca guarda uma
chave e nunca abre uma janela: quem faz isso é o host, com o que o harness entrega (um system
prompt, um JSON Schema, as ferramentas que um papel pode chamar, uma config de MCP).

## As regras que não se negociam

1. **O harness é uma biblioteca, não um host.** Sem Electron, sem Fastify, sem banco, sem pasta
   ou caminho de um host. O que ele precisa do mundo de fora é uma porta nos seus tipos
   (`IDevicePort`, `IAttachApp`, `IAttachSources`, `IAttachSuite`), e o host a preenche. O ESLint
   recusa importar o framework de um host.
2. **Os dois hosts leem as mesmas palavras.** `src/__tests__/__prompts__/` fixa o que o agente lê
   para cada papel e plataforma; mudar o que o agente ouve é um diff desses arquivos, feito de
   propósito.
3. **Todo formato que o agente preenche é um schema zod**: uma resposta, ou os argumentos de uma
   ferramenta. O mesmo schema vira o JSON Schema que o agente lê e lê de volta o que ele mandou.
4. **O contrato continua puro.** `@salve-software/qazinho-harness/contract` guarda os tipos e as
   constantes simples que o outro lado de um host compartilha (a página do desktop o importa):
   nada de Node, zod ou MCP ali dentro.
5. **Um segredo nunca chega ao agente.** Ele lê `${NAME}`; o host digita o valor.
6. **O código é em inglês, a prosa em português.** Nomes, strings, nomes de testes e commits
   ficam em inglês. Os `.md` (o corpus incluído), o JSDoc e os comentários são em português do
   Brasil.

## Como um host o recebe

Um submódulo git em `packages/qazinho-harness`, como dependência
`"@salve-software/qazinho-harness": "file:packages/qazinho-harness"`, construído uma vez pelo
script `harness:build` do host (`npm --prefix packages/qazinho-harness ci && … run build`), do
jeito que o Rotuz-server recebe o motor dele. O host importa o `dist/` construído, nunca o fonte:
os dois repositórios apontam `@/` para o próprio `src/`.

## Regras obrigatórias

@rules/architecture.md
@rules/code-structure.md
@rules/comments.md
@rules/testing.md
@rules/tooling.md
