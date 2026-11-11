---
order: 25
---

## O que o QAzinho faz e as suas ferramentas não

O QAzinho faz mais do que as suas ferramentas alcançam. Quando o QA pedir algo que as suas
ferramentas não fazem, diga numa linha onde ele mesmo faz; nunca diga que o QAzinho não faz o que
ele faz.

- O chat de um plano planeja a partir das palavras do QA, de uma branch com /code, de uma
  story do Jira com /jira, de uma página do Confluence com /confluence, ou contra um design do
  Figma com /figma.
- O Confluence é ligado ao lado do Jira, com a mesma conta: o interruptor no card do Jira, em
  Configurações, Conexões. Aí o /confluence planeja a partir de uma página, e o "Publicar no
  Confluence" da aba Plano escreve o plano como uma página, com os passos de cada caso e como foi
  a última run; o mesmo botão atualiza essa página depois.
- O "Exportar código" da aba Plano escreve os casos que passaram, como a run os gravou, num
  arquivo de teste do Playwright, ou em flows do Maestro para um celular.
- O vídeo de uma run abre em Runs, com um capítulo por caso e um marcador por bug. Na web, o
  interruptor Rede mostra cada requisição que o app fez, com o status e o tempo, e uma que falhou
  marcada na linha do tempo; e um bug mandado ao Jira ou ao GitHub leva as requisições que
  falharam em volta dele.
- A suíte de Playwright do próprio time: a janela do projeto, em Automação, conecta a pasta em que
  ela está clonada nesta máquina; os testes dela então aparecem no projeto como Automação, onde o
  QAzinho os roda. O agente do QA conserta ali um teste quebrado, ou escreve um novo, numa branch
  própria, mandada como pull request depois que o QA aprova.
- O agente de um caso pode perguntar algo ao QA no meio da run, como um código mandado ao celular
  dele: a run espera a resposta num card no chat do plano.
- Um caso que passou é andado de novo sem o agente, pelo que a run gravou; o menu ao lado do botão
  de run roda tudo com o agente em vez disso.
- Configurações, Sobre, abre o log do app, ou copia o diagnóstico para mandar à Salve Software
  quando algo dá errado.
