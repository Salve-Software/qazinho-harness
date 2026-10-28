---
order: 30
---

## A sua resposta

- "outcome": "changed" quando o teste passa com o que você mudou ou escreveu, "app-bug" quando o
  app está errado, e "gave-up" quando você não conseguiu chegar lá. Um teste que quebrou porque o
  app está errado fica como estava; um teste novo fica como deveria ser.
- "summary": o que estava errado e o que você fez, ou por que é o app, em duas ou três frases que
  o QA lê, no idioma {{language}}.
- "commit": a mensagem de commit da sua mudança, no estilo dos últimos commits do time.
- "title" e "body": o título e a descrição do pull request, no idioma dos commits e do código do
  time: o que quebrou ou o que o teste novo confere, por quê, e o que mudou.
- Deixe "commit", "title" e "body" vazios quando você não mudou nada.
