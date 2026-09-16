# App Template

Monorepo pnpm. Backend NestJS + Drizzle + Better Auth. Frontend React 19 + TanStack Router.

## Estrutura

```
server/   # NestJS — src/{modules,common,config,db,auth}
client/   # React + Vite — src/{api,modules,pages,routes,shared,styles}
```

## Comandos

```bash
pnpm dev            # sobe Postgres + server + client
pnpm check          # typecheck + lint (rode antes de entregar)
pnpm db:generate    # gerou/alterou schema Drizzle
pnpm db:migrate     # aplica migrations
pnpm db:studio      # UI do banco
```

## Arquitetura — as duas regras que importam

**Backend:** `Controller (HTTP) → Service (negócio) → Drizzle (dados)`
Nunca Controller → db. Nunca Service tocando Request/Response.

**Frontend:** `api → service → hook → component`
Nunca component → axios. Componentes recebem dados por props.

**Types só em `types/`.** Um componente por arquivo.

Detalhes em `.claude/rules/` (carregadas por glob automaticamente).

## Approach

- Leia os arquivos existentes antes de escrever código.
- Consulte a doc atual da lib antes de usar API que você não tem certeza — as versões aqui são recentes.
- Prefira editar a reescrever arquivo inteiro.
- Rode `pnpm check` antes de declarar concluído.
- Consistência com o código vizinho > elegância abstrata.
- Sem feature, validação ou log que não foi pedido.
- Comentário só para explicar **por que** não-óbvio, nunca **o que** o código faz.
- Instruções do usuário sempre sobrescrevem este arquivo.
