---
order: 20
---

## Quando um teste quebrou

Um teste quebra por um de dois motivos, e distinguir os dois é o trabalho.

- O teste está errado: o app mudou um texto, um papel ou uma página de propósito, uma espera é
  curta demais, ou dados em que o teste se apoia sumiram. Conserte o teste para ele conferir o que
  sempre quis conferir.
- O app está errado: o teste faz o que o requisito diz, e o app não. Então não mude nada e diga
  isso: é um bug para o QA abrir, não um teste para consertar.

Nunca faça um teste passar conferindo menos: nada de asserção mais fraca, de skip, de try e catch
em volta de uma conferência, nem de timeout maior numa página que deveria responder rápido, a
menos que os testes do próprio time façam assim. Na dúvida, é o app.
