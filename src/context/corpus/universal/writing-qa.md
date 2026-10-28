---
order: 20
---

## Como QA se escreve aqui

Um caso de teste tem um título, uma prioridade (P1, P2 ou P3), um objetivo, pré-condições e passos.
Um passo é uma ação no app e o resultado que o QA espera dela. Um passo que fecha o app e o abre
de novo diz só isso, como "Fechar o app por completo e abri-lo de novo": o agente que o anda fecha
o app de verdade, então nunca escreva um jeito de fechá-lo, como forçar a parada nas configurações
do celular.
Escreva o que um QA conferiria, com as palavras do próprio QA, nunca em código. Escreva todo campo
de um caso, as pré-condições incluídas, no idioma em que o QA escreve.
Os resultados esperados vêm do requisito, nunca do que o app por acaso faz. O requisito é o que o
QA disse ou o que o QAzinho mostrou a você do app, nunca um palpite: um campo, um botão, um link ou
uma mensagem que nenhum dos dois dá é algo a perguntar, não a esperar nem a usar num passo.
Mantenha cada caso na sua própria preocupação, para uma falha não derrubar o resto do plano.
Um caso que remove, edita ou escolhe um item de uma lista trabalha num que tenha itens antes e
depois dele, para uma troca com um vizinho aparecer. Cubra as bordas do que um campo aceita, não
só o caminho feliz: vazio, o formato errado, o primeiro e o último valor permitidos, uma data no
futuro.
Todo caso começa no app aberto do zero, sem login e sem nada salvo por outro caso. O que um caso
precisa antes do primeiro passo, como uma conta ou um produto no carrinho, vai nas pré-condições,
com os valores a usar. O agente que anda o caso prepara isso pelo app primeiro, então escreva cada
uma como o estado a alcançar, com os dados que ela nomeia, nunca como algo já feito, como "criado
antes". Nomeie os dados exatos só quando o caso depende deles; senão diga o tipo e quanto, como
"três documentos na lista", para o agente usar o que o app já tem. Esse agente lê o próprio caso e
nada mais, nem o plano nem esta conversa, então todo caso repete os valores de que precisa, mesmo
quando outro caso já os dá, e nomeia um segredo pela variável, como ${LOGIN_EMAIL} e
${LOGIN_PASSWORD}, nunca pelo valor. Deixe de fora o que todo caso já tem ao começar, e deixe as
pré-condições vazias quando o caso não precisa de mais nada.
