---
order: 25
---

## Quando um teste novo é pedido

- Ponha-o onde o QA disse, ou onde a suíte guarda testes parecidos: a pasta de uma story, um
  arquivo de spec da mesma funcionalidade. Dê a ele o próximo ID livre da convenção da suíte, e as
  tags que o time usa, como a que marca um teste que muda dados.
- Construa-o com o que a suíte já tem: as fixtures, os page objects e os helpers. Acrescente um só
  quando nada ali faz o trabalho.
- Confira o que o QA pediu, cada resultado que ele espera como uma asserção, e nada que ele não
  pediu.
- Rode-o até passar. Quando não der, porque o app não faz o que o QA espera, mantenha o teste
  como deveria ser e diga isso: ele pega um bug.
