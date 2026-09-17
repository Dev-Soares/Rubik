# App Template

Monorepo pnpm. Backend NestJS + Drizzle + Better Auth. Frontend React 19 + TanStack Router.

## Estrutura

```
server/   # NestJS — src/{modules,common,config,db}
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

**Mobile first, sempre.** Classe sem prefixo é o celular; `sm:`/`md:`/`lg:` só
acrescentam. Nunca `max-*` para consertar o pequeno depois.

**Função pura só em `utils/`.** Nunca solta no arquivo do service ou do componente.
Exceções: mapper de row da própria feature (`toPublicRole`) e formatação de
apresentação não exportada (`getInitials`).

**`common/` (server) e `shared/` (client) são só para o que dois módulos usam.**
Código de domínio com um consumidor só → mora dentro do módulo. Infra transversal
(guard, pipe, filter, interceptor, layout, `ui/`) fica, mesmo com um consumidor.

Detalhes em `.claude/rules/` (carregadas por glob automaticamente).

## Approach

- Leia os arquivos existentes antes de escrever código.
- Consulte a doc atual da lib antes de usar API que você não tem certeza — as versões aqui são recentes.
- Prefira editar a reescrever arquivo inteiro.
- Rode `pnpm check` antes de declarar concluído.
- Consistência com o código vizinho > elegância abstrata.
- Sem feature, validação ou log que não foi pedido. Exceção: feature nova visível
  ao usuário exige seção na aba "Como usar" (`.claude/rules/client/guide.md`) —
  isso faz parte da entrega, não é escopo extra.
- Comentário só para explicar **por que** não-óbvio, nunca **o que** o código faz.
- Instruções do usuário sempre sobrescrevem este arquivo.
