# Setup de um projeto novo a partir do Rubik

Procedimento para a **primeira subida** de um projeto derivado do template.
Escrito para um agente executar, de cima para baixo, sem pular etapa.

Entrada: o repositório do projeto novo, criado por um dos dois caminhos da
etapa 1 — o botão **Use this template** do GitHub (recomendado) ou um
`git clone` do Rubik.
Saída: os três serviços no ar, banco migrado, admin criado e os dois remotes
configurados.

**Antes de começar, confirme por qual dos dois o repositório nasceu**: a etapa 1
muda conforme o caso, e refazer remote depois de commitar dá retrabalho. No
caminho B é preciso também a URL do repositório novo — se não foi informada,
pergunte.

---

## 0. Pré-requisitos

Confirme os três antes de seguir. Nenhum é instalável pelo agente.

```bash
node --version      # precisa de 22 ou maior
pnpm --version
docker info         # precisa responder; se falhar, o Docker Desktop está fechado
```

Docker fechado é a causa mais comum de falha nas etapas 2 e 3. Pare e peça para
abrir — não tente contornar.

---

## 1. Remotes: projeto novo e template

A configuração final tem dois remotes com papéis distintos, nos dois caminhos:

| Remote | Aponta para | Serve para |
|---|---|---|
| `origin` | repositório do projeto novo | o trabalho do dia a dia (`git push`) |
| `template` | Rubik | **só puxar** melhoria futura do template |

### Caminho A — botão "Use this template" (recomendado)

O repositório nasce com **um commit só**, sem o histórico do Rubik, e `origin`
já aponta para o lugar certo. Falta acrescentar o `template`:

```bash
git remote add template https://github.com/Dev-Soares/Rubik.git

# `template` fica somente-leitura: bloqueia push acidental para o Rubik.
git remote set-url --push template DISABLED
```

### Caminho B — `git clone` do Rubik

O clone copia o `.git` inteiro: o projeto herda todos os commits do Rubik, e
`origin` aponta para **ele**. Isso precisa mudar antes do primeiro commit,
senão o código do cliente vai para o template.

```bash
# 1. O Rubik deixa de ser `origin` e passa a ser `template`.
git remote rename origin template

# 2. O repositório do projeto novo assume `origin`.
git remote add origin <url-do-repo-novo>

# 3. `template` fica somente-leitura: bloqueia push acidental para o Rubik.
git remote set-url --push template DISABLED
```

O preço é o `git log` e o `git blame` do projeto ficarem com commits que falam
de decisões de outro produto, para sempre. Em troca, há ancestral comum com o
template — e é só por isso que o `git merge` da seção abaixo funciona.

### Confira (nos dois caminhos)

A saída tem que mostrar `DISABLED` na linha de push do `template`:

```bash
git remote -v
```

```
origin    git@github.com:org/projeto-novo.git   (fetch)
origin    git@github.com:org/projeto-novo.git   (push)
template  https://github.com/Dev-Soares/Rubik.git  (fetch)
template  DISABLED                                 (push)
```

Depois publique a `main` no repositório novo e passe a rastreá-lo:

```bash
git push -u origin main
```

### Puxar melhoria do template depois

Não faz parte do setup — é para quando o Rubik evoluir. **O caminho depende de
como o repositório nasceu**, e misturar os dois é a origem do erro
`refusing to merge unrelated histories`.

#### Veio do "Use this template" (caminho A)

Não há ancestral comum: o repositório começou num commit órfão, então
`git merge template/main` recusa, e com `--allow-unrelated-histories` ele
marca **todo arquivo** como conflito — o git não tem como distinguir "mudou" de
"sempre foi diferente". Não use merge aqui.

O que funciona é **copiar o arquivo** da outra árvore. `git checkout` com
`--` aceita um remote sem ancestral comum:

```bash
git fetch template

# 1. Ver o que mudou no template desde a sua cópia:
git diff HEAD template/main -- .claude/rules/ AGENTS.md

# 2. Trazer só o que interessa (um caminho por vez, revisando o diff antes):
git checkout template/main -- .claude/rules/
git checkout template/main -- .github/workflows/ci.yml

# 3. Os arquivos chegam staged. Confira e commite:
git status
git commit -m "chore: atualiza as rules a partir do template"
```

Serve bem para o que o projeto derivado **não** costuma editar: `.claude/rules/**`,
`AGENTS.md`, `.github/workflows/`, `eslint.config`, `.prettierrc`,
`.gitattributes`. É justamente onde o template evolui.

Para **código** (`client/src`, `server/src`), isto sobrescreve o arquivo
inteiro e apaga o que o projeto fez. Ali, leia o diff e porte a mudança à mão.

#### Veio de `git clone` (caminho B)

Há ancestral comum, então o merge de verdade funciona:

```bash
git fetch template
git merge template/main        # ou: git cherry-pick <sha> para trazer só um commit
```

Conflito aqui é normal e esperado: o projeto derivado divergiu de propósito.
Resolva a favor do projeto, exceto quando a mudança do template é justamente o
que você quer.

#### Em qualquer um dos dois

O template não versiona (`AGENTS.md` §2), então não existe tag ou release para
comparar: o que você tem é o diff. Traga uma mudança por commit, com o motivo
na mensagem — seis meses depois, `git log` é o único registro de por que aquele
arquivo veio de fora.

---

## 2. Subir os três serviços

Um comando. Não existe passo de preparação separado.

```bash
pnpm dev
```

O que acontece, em ordem:

1. O compose sobe `postgres`, `server` e `client`.
2. O container do server aplica as migrations e cria o admin **antes** de a API
   subir (está no `CMD` de `server/Dockerfile.dev`).

Rodar de novo é seguro: migration já aplicada não repete, e o seed reconhece o
admin existente.

As portas são **fixas**:

| Serviço | Porta |
|---|---|
| Aplicação | `3001` |
| API | `3000` |
| Postgres | `5432` |
| Drizzle Studio | `4983` |

Porta ocupada por outro projeto da máquina → o compose falha com `port is
already allocated`. Pare o outro projeto, ou mude o valor no `.env` da raiz à
mão (`CLIENT_PORT`, `SERVER_PORT`, `POSTGRES_PORT`).

### Conferir que subiu

```bash
docker compose --profile dev ps          # os três `Up`, postgres `healthy`
curl http://localhost:3000/health
```

A resposta esperada é `{"status":"ok","db":"connected",...}`. `db` em qualquer
outro valor significa que a API subiu mas não alcança o banco — veja
`docker logs rubik-server`.

---

## 3. Credencial inicial

O seed cria um único usuário, igual em todo projeto que nasce do Rubik:

```
desenvolvedor@letsup.team / 123mudar
```

**Troque a senha no primeiro login.** Serve para entrar, não para trabalhar.

Se o login falhar com a senha certa, o provável é `CORS_ORIGIN` ou
`BETTER_AUTH_URL` apontando para porta diferente da que o browser usou. Ambos
derivam de `CLIENT_PORT` no compose; confirme com:

```bash
docker compose --profile dev config | grep -E 'CORS_ORIGIN|BETTER_AUTH_URL|VITE_API_URL'
```

---

## 4. Variáveis de ambiente

O perfil dev **não exige nenhum `.env`**: o compose traz default para tudo que
`env.ts` cobra, inclusive as portas.

Dois arquivos, com papéis diferentes:

| Arquivo | Quem escreve | Para que serve |
|---|---|---|
| `.env` da raiz | `pnpm setup`, ou você | portas do host e segredos, lidos pelo compose |
| `server/.env`, `client/.env` | `pnpm setup` | só o caminho `dev:local` (sem Docker no app) |

Nenhum dos três é versionado.

### Quando precisa mexer

Só para ligar integração opcional, sempre no `.env` da **raiz** (o compose
repassa ao container):

```bash
# Storage das fotos de chamado. Vazio = upload desligado, resto funciona.
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=us-east-1

# Sistema externo que recebe cada chamado. Vazio = envio desligado.
TICKET_WEBHOOK_URL=
TICKET_WEBHOOK_API_KEY=
TICKET_WEBHOOK_PROJECT_ID=
```

`BETTER_AUTH_SECRET` e `INTEGRATION_API_KEY` têm default de desenvolvimento no
compose. **Em deploy real cada um vem do gerenciador de segredo do ambiente** —
nunca do repositório, nunca do valor que está no compose.

O `.env.example` da raiz lista tudo que o compose lê.

---

## 5. Comandos do dia a dia

```bash
pnpm dev            # sobe os três em container, com hot reload
pnpm dev:logs       # acompanha o log dos três
pnpm dev:down       # derruba, preservando o volume do banco
pnpm dev:reset      # derruba APAGANDO o banco e sobe limpo

pnpm db:generate    # gerou mudança de schema -> cria a migration
pnpm db:migrate     # aplica
pnpm db:studio      # Drizzle Studio
pnpm shell:db       # psql no banco do container

pnpm check          # typecheck + lint; rode antes de abrir PR
```

`pnpm dev:reset` destrói o banco de desenvolvimento, inclusive o que você
cadastrou testando. É o comando certo quando a migration ficou inconsistente, e
o errado em qualquer outro caso.

---

## 6. Adaptar o template ao projeto

Nesta ordem, porque a primeira etapa muda o que aparece na tela:

1. **Remova o que o projeto não usa.** Cada feature é um módulo isolado: apague
   `server/src/modules/<feature>/`, `client/src/modules/<feature>/`, a entrada em
   `client/src/shared/layouts/navigation.ts` e a seção correspondente em
   `client/src/modules/guide/types/guideContent.ts`. Candidatos típicos:
   `tickets`, `audit`, `notifications`.
2. **Renomeie a aplicação.** `name` nos três `package.json`, o título em
   `client/index.html`, `AppLogo` e o nome do banco (`rubikdb`) no compose.
3. **Zere a versão.** `client/package.json` para `0.1.0` — é de lá que sai o
   número no rodapé da sidebar, e o histórico de versão do template não é o do
   projeto novo.
4. **Leia `AGENTS.md`.** Normativo do repositório: checklist de entrega e
   roteamento das regras de `.claude/rules/**`. Vale no derivado igual.

Feature nova visível ao usuário exige seção na aba "Como usar" antes de ser
considerada pronta — `.claude/rules/client/guide.md`.

---

## Se algo falhar

| Sintoma | Causa provável |
|---|---|
| `port is already allocated` | Outro projeto da máquina ocupa 3000, 3001 ou 5432. Pare o outro, ou mude a porta no `.env` da raiz. |
| `Cannot connect to the Docker daemon` | Docker Desktop fechado. |
| `db: "disconnected"` no `/health` | Postgres ainda subindo, ou `DATABASE_URL` divergente. Veja `docker logs rubik-postgres`. |
| Login falha com a senha certa | `CORS_ORIGIN`/`BETTER_AUTH_URL` em porta diferente da do browser. Etapa 3. |
| `password authentication failed for user "..."` nos logs do Postgres | Outro projeto da máquina conectando na mesma porta. O usuário do template é `postgres`. |
| Tela branca, erro de rota no console | `routeTree.gen.ts` dessincronizado. É gerado pelo Vite; derrube e suba de novo. |

Erro que não está nesta tabela e tem causa não-óbvia: catalogue em
`.claude/rules/licoes.md`, no mesmo commit do conserto.
