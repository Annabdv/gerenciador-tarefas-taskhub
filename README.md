# Atividade 2 — CRUD com autenticação

Você vai construir uma aplicação web pequena, **do zero**, e publicá-la no
servidor da disciplina. O que se avalia não é o tamanho do sistema — é o
processo: issues, branches, pull requests, deploy e o uso de IA como par de
programação.

## O que a aplicação precisa ter

**1. Uma entidade à sua escolha.** Livro, planta, treino, receita, chamado,
personagem — o que você quiser, desde que faça sentido ter vários registros com
alguns campos. Escolha algo que te interesse; você vai olhar para isso por
algumas semanas.

**2. CRUD completo dessa entidade:** cadastrar, listar, editar e remover.

**3. Autenticação de usuários.** Quem não está logado não cria, não edita e não
remove nada. Cadastro e login ficam a seu critério (sessão, JWT, o que preferir).

**4. Um endpoint `/healthz`** que faça uma **consulta vazia ao banco** — algo
como `SELECT 1`. Se o banco responder, devolva `200`; se não, devolva erro. Um
`/healthz` que sempre retorna `200` não testa nada: a graça é ele falhar quando
o banco cair.

## Regras do jogo

**O projeto nasce do zero.** Nada de reaproveitar código de outra disciplina, de
repositório antigo ou de projeto pronto da internet. O primeiro commit é um
repositório vazio.

**Use inteligência artificial.** Não é permitido apenas — é **exigido**. Escolha
sua ferramenta e trabalhe com ela.

**Exija que a IA commite e faça push continuamente.** Não desenvolva tudo e
commite no fim. O histórico do repositório é parte da entrega: ele precisa
mostrar a construção acontecendo, passo a passo. Se a sua ferramenta faz commit
sozinha, deixe; se não faz, peça explicitamente a cada trecho concluído.

## Como trabalhar

Este é o fluxo que se usa em equipe de verdade. Você vai praticá-lo sozinho para
que ele já seja natural quando houver equipe.

### 1. Crie as issues e atribua a você mesmo

Antes de escrever código, abra as issues no seu repositório, na aba **Issues** —
uma por funcionalidade. Atribua todas a você (*Assignees* → seu usuário). Elas
são o seu plano; sem elas você descobre o que faltava quando já não dá tempo.

Um exemplo de lista está em
[`exemplo-atividade2-crud`](https://github.com/lab-rodrigor/exemplo-atividade2-crud/issues) —
veja o tamanho e o texto das issues, e adapte à sua entidade.

### 2. Uma branch por issue

```bash
git switch -c 07-cadastrar-entidade
```

O nome começa com o número da issue. Assim, meses depois, dá para ligar o código
ao motivo dele.

### 3. Implemente com a IA

Trabalhe na branch, com commits pequenos e frequentes. Mensagem de commit
explica **por que**, não o que — o diff já diz o que mudou.

### 4. Pull request e merge

Ao terminar a funcionalidade, abra um pull request da sua branch para a `main`.
Escreva no corpo o que foi feito e use `Closes #7` para a issue fechar sozinha
no merge.

Como você não está em equipe, **você mesmo aprova e faz o merge**. Ainda assim,
leia o próprio diff antes: é a última chance de ver o que a IA escreveu e você
não percebeu.

### 5. Publique no servidor

Push na `main` dispara o deploy, como na atividade anterior. Confira a aplicação
no seu endereço e teste o `/healthz`.

## Ordem sugerida das issues

Você pode organizar como quiser, mas esta ordem respeita as dependências e
mantém você com algo funcionando desde cedo:

| # | Issue | Por que nessa posição |
|---|---|---|
| 1 | Esqueleto do projeto e `docker compose up` | ter algo que sobe antes de ter o que mostrar |
| 2 | Conexão com o banco e `/healthz` com consulta vazia | prova que a aplicação alcança o banco |
| 3 | Deploy no servidor funcionando | descubra problema de publicação com 20 linhas, não com 2000 |
| 4 | Modelo da entidade e criação da tabela | a base do CRUD |
| 5 | Cadastro de usuário | precisa existir antes do login |
| 6 | Login e sessão | |
| 7 | Proteger as rotas de escrita | aqui a autenticação passa a valer de fato |
| 8 | Cadastrar a entidade | |
| 9 | Listar a entidade | |
| 10 | Editar a entidade | |
| 11 | Remover a entidade | |
| 12 | README com o que é o projeto e como rodar | quem chega depois precisa entender |

O item 3 costuma ser deixado para o fim — e é o erro clássico. Publicar cedo
transforma o deploy em rotina em vez de crise na véspera.

## O que será avaliado

- As issues existem, estão atribuídas a você e descrevem o trabalho
- Cada funcionalidade nasceu numa branch e entrou por pull request
- O histórico mostra construção contínua, não um despejo final
- A aplicação está no ar, com `/healthz` respondendo de verdade
- O CRUD funciona e a autenticação protege o que deve proteger

## Dúvidas

No canal da atividade, no Discord.
