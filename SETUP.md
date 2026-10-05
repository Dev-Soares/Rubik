# Setup de um projeto novo a partir do Rubik

Procedimento para a **primeira subida** de um projeto derivado do template.
Escrito para um agente executar, de cima para baixo, sem pular etapa.

Entrada: um clone do Rubik e a URL do repositório vazio do projeto novo.
Saída: os três serviços no ar, banco migrado, admin criado e os dois remotes
configurados.

Se a URL do repositório novo não foi informada, **pergunte antes de começar** —
a etapa 1 depende dela e refazer remote depois de commitar dá retrabalho.

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

O clone vem com `origin` apontando para o **Rubik**. Isso precisa mudar antes do
primeiro commit, senão o código do cliente vai para o template.

A configuração final tem dois remotes com papéis distintos:

| Remote | Aponta para | Serve para |
|---|---|---|
| `origin` | repositório do projeto novo | o trabalho do dia a dia (`git push`) |
| `template` | Rubik | **só puxar** melhoria futura do template |

```bash
# 1. O Rubik deixa de ser `origin` e passa a ser `template`.
git remote rename origin template

# 2. O repositório do projeto novo assume `origin`.
git remote add origin <url-do-repo-novo>

# 3. `template` fica somente-leitura: bloqueia push acidental para o Rubik.
git remote set-url --push template DISABLED
```

Confira — a saída tem que mostrar `DISABLED` na linha de push do `template`:

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

Não faz parte do setup — é para quando o Rubik evoluir:

```bash
git fetch template
git merge template/main        # ou: git cherry-pick <sha> para trazer só um commit
```

Conflito aqui é normal e esperado: o projeto derivado divergiu de propósito.
Resolva a favor do projeto, exceto quando a mudança do template é justamente o
que você quer.

---

## 2. Subir os três serviços

Um comando. Não existe passo de preparação separado.

```bash
pnpm dev
```

O que acontece, em ordem:

1. `scripts/ports.mjs` escolhe as portas do host e grava no `.env` da raiz.
   Porta padrão ocupada por outro projeto da máquina → desvia para a próxima
   livre e avisa na saída.
2. O compose sobe `postgres`, `server` e `client`.
3. O container do server aplica as migrations e cria o admin **antes** de a API
   subir (está no `CMD` de `server/Dockerfile.dev`).

Rodar de novo é seguro: migration já aplicada não repete, e o seed reconhece o
admin existente.

> **Leia as portas na saída do comando, não neste documento.** Quando há desvio,
> o script imprime as URLs reais — `! Aplicação: 3001 ocupada → 3002`. Os
> padrões são 3001 (aplicação), 3000 (API) e 5432 (Postgres).

### Conferir que subiu

```bash
docker compose --profile dev ps          # os três `Up`, postgres `healthy`
curl http://localhost:<SERVER_PORT>/health
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
derivam de `SERVER_PORT`/`CLIENT_PORT` no compose; confirme com:

```bash
docker compose --profile dev config | grep -E 'CORS_ORIGIN|BETTER_AUTH_URL|VITE_API_URL'
```

---

## 4. Variáveis de ambiente

O perfil dev **não exige nenhum `.env`**: o compose traz default para tudo que
`env.ts` cobra, e `scripts/ports.mjs` escreve as portas sozinho.

Dois arquivos, com papéis diferentes:

| Arquivo | Quem escreve | Para que serve |
|---|---|---|
| `.env` da raiz | `scripts/ports.mjs` | portas do host, lidas pelo compose |
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
| `port is already allocated` | `scripts/ports.mjs` não rodou. Use `pnpm dev`, não `docker compose up` direto. |
| `Cannot connect to the Docker daemon` | Docker Desktop fechado. |
| `db: "disconnected"` no `/health` | Postgres ainda subindo, ou `DATABASE_URL` divergente. Veja `docker logs rubik-postgres`. |
| Login falha com a senha certa | `CORS_ORIGIN`/`BETTER_AUTH_URL` em porta diferente da do browser. Etapa 3. |
| `password authentication failed for user "..."` nos logs do Postgres | Outro projeto da máquina conectando na mesma porta. O usuário do template é `postgres`. |
| Tela branca, erro de rota no console | `routeTree.gen.ts` dessincronizado. É gerado pelo Vite; derrube e suba de novo. |

Erro que não está nesta tabela e tem causa não-óbvia: catalogue em
`.claude/rules/licoes.md`, no mesmo commit do conserto.
