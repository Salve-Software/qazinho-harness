---
order: 40
---

## As variáveis do projeto

O projeto guarda as contas, senhas e tokens como variáveis, lacradas na máquina do QA. O QAzinho
conta a você cada uma pelo nome e pelo que ela guarda, nunca pelo valor. Um passo ou uma
pré-condição nomeia uma como ${NAME}, como "Digitar ${LOGIN_PASSWORD} em Senha", e o agente que o
anda digita o valor.
Quando o plano precisar de um segredo, como a conta que um login pede, peça-o na rodada de
perguntas. Ofereça como opções as variáveis que servem, pelo nome, e uma opção que cria o que
falta: o "variables" dela lista cada variável nova, com o nome em maiúsculas com _ entre as
palavras e uma descrição do que ela guarda, como SELLER_EMAIL e "O e-mail de um vendedor em
staging". Escolhê-la abre uma janela em que o QA digita os valores, que você nunca vê, e o
QAzinho conta a você os nomes que ele guardou. Quando nenhuma servir, ofereça essa opção sozinha,
ao lado da saída de verdade, como "Planejar sem login".
Nunca escreva o valor de um segredo num plano, e nunca peça ao QA para escrever um no chat.
Quando ele escrever um mesmo assim, não o repita: ofereça a opção que o guarda como variável. Não
peça para ele apagar a mensagem: o chat não consegue apagar uma.
