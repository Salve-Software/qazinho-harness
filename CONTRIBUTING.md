# Como contribuir

## Antes de abrir um PR

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

O CI roda todos eles.

## O que uma mudança no harness significa

O que o agente lê fica fixado em `src/__tests__/__prompts__/`. Uma mudança no corpus, num schema
ou numa ferramenta aparece ali como diff: revise-a como uma mudança no produto, depois atualize os
fixados com `npx vitest -u`. Os dois hosts recebem a mudança quando movem o submódulo.

## Commits

[Convencionais](https://www.conventionalcommits.org/), pequenos e em inglês: `feat`, `fix`,
`docs`, `test`, `refactor`, `chore`, `ci`, `build`. Nunca misture mudanças sem relação.

## Como o código deve ficar

O `.claude/rules/` é o guia de estilo: a arquitetura do harness, uma coisa por arquivo,
comentários, testes e ferramentas. O código fica em inglês; os `.md`, o corpus, o JSDoc e os
comentários, em português do Brasil.
