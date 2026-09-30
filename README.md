<div align="center">

# Rubik

**O ponto de partida das aplicações.**

Autenticação, usuários, cargos por tela, auditoria, notificações e chamados —
prontos no primeiro `git clone`. Você começa pela regra de negócio, não pela
tela de login.

`NestJS` · `React 19` · `PostgreSQL` · `Drizzle` · `Better Auth` · `Tailwind v4`

</div>

---

## Começar

Precisa de **Node 22+**, **pnpm** e **Docker Desktop** rodando.

```bash
git clone <url-do-repo> meu-projeto
cd meu-projeto
pnpm setup
pnpm dev
```

`pnpm setup` roda uma vez: confere os pré-requisitos, cria os `.env` com
segredos aleatórios, instala tudo, sobe o banco, aplica as migrations e cria o
admin. `pnpm dev` é o comando do dia a dia.

| | |
|---|---|
| Aplicação | <http://localhost:3001> |
| API e docs | <http://localhost:3000/docs> |
| Login inicial | `desenvolvedor@letsup.team` / `123mudar` |

> **Troque a senha do admin no primeiro login.** A credencial é a mesma em todo
> projeto que nasce do Rubik — serve para entrar, não para trabalhar.

---

## O que já vem pronto

| | |
|---|---|
| **Autenticação** | Sessão em cookie `httpOnly`, cadastro público desligado, troca de senha. Better Auth, sem JWT na mão. |
| **Usuários** | CRUD completo, perfil, avatar, admin define senha. |
| **Cargos e telas** | Permissão por tela, com override por usuário. Guard no backend, sidebar filtrada no frontend. |
| **Auditoria** | Registro de uso com filtro e timeline paginada. |
| **Notificações** | Sino com contador, lista e marcação de leitura. |
| **Chamados** | Abertura com foto, status, integração opcional com sistema externo de atendimento. |
| **Aba "Como usar"** | Guia do usuário versionado junto com o código. |
| **Tema** | Claro e escuro por tokens, shadcn/ui, mobile first. |

Cada um é um módulo isolado. O que o seu projeto não usa, você deleta —
`modules/<feature>/` no server e no client, e a entrada em `navigation.ts`.

---

## Comandos

### Dia a dia

```bash
pnpm dev             # tudo em container, com hot reload
pnpm dev:local       # server e client no host, só o banco em container (mais rápido)
pnpm dev:logs        # logs dos containers
pnpm dev:down        # derruba
pnpm check           # typecheck + lint — rode antes de abrir PR
```

### Banco

```bash
pnpm db:generate     # gerou schema novo? gere a migration
pnpm db:migrate      # aplica as migrations
pnpm db:studio       # interface visual do banco
pnpm db:seed         # recria o admin e os cargos de sistema
pnpm shell:db        # psql direto
```

Os comandos `db:*` da raiz rodam **dentro do container** — precisam do
`pnpm dev` no ar. Para rodar contra o banco do host, use
`pnpm --filter server db:migrate`.

### Outros

```bash
pnpm ui:add <nome>   # adiciona componente do shadcn
pnpm build           # build de produção
pnpm docker:prod     # sobe as imagens de produção localmente
pnpm dev:reset       # ⚠️ apaga o volume do Postgres e sobe do zero
```

---

## Arquitetura

Monorepo pnpm com dois apps e uma regra de camada em cada lado.

```
server/src/
  modules/<feature>/     Controller → Service → Drizzle
  common/                guards, filters, pipes, o que dois módulos usam
  db/schema/             tabelas Drizzle
  config/env.ts          toda variável de ambiente, validada por Zod no boot

client/src/
  modules/<feature>/     api → service → hook → component
  shared/                layouts, ui do shadcn, o que duas features usam
  routes/                TanStack Router (file-based) — só configuração, sem JSX
  pages/                 a UI que a rota aponta
```

Duas regras que não se quebram:

- **Backend:** Controller nunca fala com o banco. Service nunca conhece
  `Request`.
- **Frontend:** componente nunca chama axios nem monta `queryKey`. Ele recebe
  props.

O detalhe de cada camada está em [`.claude/rules/`](.claude/rules/), e o
normativo curto em [`AGENTS.md`](AGENTS.md) — valem para pessoa e para agente.

---

## Configuração

Tudo em `server/.env`, validado por Zod em `server/src/config/env.ts`. Variável
faltando ou fora do formato derruba o boot com a mensagem exata — nunca com um
`undefined` três camadas adiante.

O `pnpm setup` já gera um `.env` funcional. O que talvez você queira mexer:

| Variável | Para quê |
|---|---|
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Liga o upload de foto nos chamados. Vazio: a aplicação roda, só o upload fica desligado. Use AWS S3 ou Cloudflare R2 (R2 exige `S3_ENDPOINT` + `S3_FORCE_PATH_STYLE=true`). |
| `TICKET_WEBHOOK_URL` | Envia cada chamado aberto para um sistema externo. Vazio desliga. |
| `INTEGRATION_API_KEY` | Deixa o sistema externo marcar chamado como resolvido, via header `x-api-key`. |
| `CORS_ORIGIN` | Origens liberadas, separadas por vírgula. |

O admin inicial é **fixo no código** (`server/src/db/seed.ts`), não em variável
de ambiente. Em produção o seed só roda contra base vazia: um sistema com gente
dentro nunca ganha um admin de senha conhecida.

---

## Renomear o projeto

O Rubik se identifica como `rubik` no `package.json`, nos containers e no banco.
Dois projetos derivados rodando ao mesmo tempo colidem no nome do container e na
porta 5432. Antes de começar, troque `rubik` por `<seu-projeto>` em:

- `package.json` → `name` e o `-d rubikdb` do `shell:db`
- `docker-compose.yml` → `container_name`, `POSTGRES_DB`, `DATABASE_URL`
- `server/.env` e `server/.env.example` → `DATABASE_URL`
- `client/index.html` → `<title>`

Depois, `pnpm dev:reset` para o banco nascer com o nome novo.

---

## Deploy

Cada app tem seu `Dockerfile` de produção e um `railway.json`. No Railway, dois
serviços apontando para o mesmo repo, cada um com seu `railway.json`. O server
expõe `/health` para o healthcheck e roda as migrations no boot.

Em produção, garanta: `NODE_ENV=production`, `BETTER_AUTH_SECRET` com 32+
caracteres aleatórios (nunca o do dev), `CORS_ORIGIN` com o domínio real e
`DATABASE_URL` do banco gerenciado.

---

## Problemas comuns

| Sintoma | O que é |
|---|---|
| `pnpm setup` para em "Docker não está rodando" | Abra o Docker Desktop e rode de novo. |
| Porta 5432 ocupada | Outro Postgres no host ou outro projeto derivado do Rubik. Derrube o outro, ou renomeie este projeto (seção acima). |
| Login não persiste | `CORS_ORIGIN` não bate com a origem do client, ou `VITE_API_URL` aponta para outro host. O cookie de sessão precisa dos dois alinhados. |
| Upload de foto dá 503 | Storage desligado — é o default. Configure as `S3_*`. |
| `routeTree.gen.ts` com conflito no git | É gerado. Aceite qualquer lado e rode `pnpm dev` para regenerar. |
| Migration não aplica | Rodou `pnpm db:migrate` com os containers no ar? Sem `pnpm dev`, use `pnpm --filter server db:migrate`. |

---

<div align="center">
<sub>Up · uso interno</sub>
</div>
