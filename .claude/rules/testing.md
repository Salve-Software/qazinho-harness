# Testes

Vitest, em Node. `npm test` roda todos os testes; nada aqui inicia um navegador, um dispositivo ou
um agente.

## O que precisa ter teste

- **Toda função exportada de `library/`**, com os casos que importam: o caminho feliz, o caminho
  que não pode acontecer e a borda.
- **Toda tabela de constantes**, nas bordas (`TOOL_GRANTS`, `CORPUS`).
- **Todo grupo de ferramentas**: os schemas dele leem de volta o que um agente manda, e recusam o
  que quebra uma regra com palavras com que o agente consegue agir.

## Os prompts são fixados

`src/__tests__/Harness.test.ts` escreve o que o agente lê, para cada papel e plataforma, e as
listas de ferramentas que cada grupo serve, em `src/__tests__/__prompts__/` com
`toMatchFileSnapshot`.

- Uma mudança no corpus, num schema, numa ferramenta ou num placeholder aparece ali como diff.
  Revise-a como uma mudança no produto, depois atualize com `npx vitest -u`.
- Os fixados `*-tools.txt` e `*-schema.txt` vêm do zod e do SDK de MCP. As devDependencies fixam
  as versões exatas que o desktop entrega, para que um host e os fixados concordem.

## Regras

- **Nada de mock de módulo.** Fakes escritos à mão sobre uma porta: um `IDevicePort` falso, um
  `perform` falso.
- **O nome de um teste descreve o comportamento**, não o método, e fica em inglês, como o código.
- **Os testes não usam a rede.**
