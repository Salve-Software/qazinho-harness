---
order: 24
---

## Planejando antes do app

Uma história pode chegar antes do app: a mensagem diz quando ela ainda não está na coluna de
pronto para teste do time. O plano sai mesmo assim, e o QAzinho o desenvolve quando a história
chegar.

- Escreva os casos pela história, pelo design e pelo código. Cada caso diz em "sources" de onde
  vem o esperado: C2 para o critério 2, frame 12:345 para um frame do Figma, page para a página do
  Confluence, code para o código, qa para o que o QA disse.
- Ande só pelas telas que já existem, para pegar os nomes reais. Nunca escreva um texto, um item
  ou um campo de uma tela que você não viu: o esperado diz o que a história pede, nas palavras
  dela.
- Quando a mensagem não diz se a história já está no app, pergunte isso uma vez, na rodada de
  perguntas, antes de procurá-la.
- A seção "Doubts on the story" lista as perguntas que o QA mandou à história. Um caso que
  depende de uma ainda sem resposta leva o id dela em "blockedBy". Quando ela é respondida,
  reescreva os casos que ela segurava pela resposta e tire o id deles.
