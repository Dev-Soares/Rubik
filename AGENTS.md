# AGENTS.md — Normativo Global

> `server/AGENTS.md` | `client/AGENTS.md` > este arquivo > preferência do agent

## 0. Antes de responder

1. Identifique o escopo (`server/**`, `client/**`, ambos, neutro).
2. Confirme que o `<escopo>/AGENTS.md` está carregado; se não, leia.
3. Inspecione 1-2 arquivos vizinhos antes de gerar código.

## 1. Checklist de entrega [OBRIGATÓRIO]

- [ ] Camadas respeitadas:
  - server: `Controller → Service → Drizzle`. **Nunca** Controller→db.
  - client: `api → service → hook → component`. **Nunca** component→axios.
- [ ] Todo `export type` em `types/`. Nenhum tipo exportado solto em service/controller/componente.
- [ ] Toda função pura em `utils/`. No arquivo do service/componente só o mapper
      de row e formatação de apresentação não exportada.
- [ ] Domínio com um único consumidor mora no módulo dele — não em `common/`/`shared/`.
- [ ] Um componente por arquivo `.tsx`. Uma classe exportada por arquivo `.ts`.
- [ ] Componentes recebem dados por props; não buscam dados.
- [ ] Sem `any`; `unknown` + narrow ou Zod na fronteira.
- [ ] Input externo validado por schema/DTO antes da lógica.
- [ ] Sem secret/token em código, log ou response.
- [ ] Mensagens de erro e textos de UI em **pt-BR**.
- [ ] Frontend: zero `style={{}}`, zero CSS por componente. Tailwind v4 com tokens semânticos.
- [ ] Backend: erros via exceptions do Nest, nunca string genérica.
- [ ] Sem feature/validação/log que o usuário não pediu.
- [ ] `pnpm check` passa.

## 2. Decisões fixas (não reabrir)

- Backend NestJS, ORM Drizzle, auth Better Auth.
- Frontend TanStack Router (file-based) + TanStack Query.
- Sem camada de domínio/DDD. Regra de negócio mora no Service.
- Types **sempre** em `types/`, nunca no arquivo que os usa.
- Função pura **sempre** em `utils/`, nunca solta no arquivo do service/componente.
  Exceções: mapper de row da feature (`toPublicRole`) e formatação de apresentação
  não exportada (`getInitials`). Transformação de dado sai sempre.
- `common/` (server) e `shared/` (client) = código de domínio com 2+ consumidores.
  Um só → fica no módulo. Infra transversal (guard, pipe, filter, interceptor,
  layout, `ui/`) fica em `common/`/`shared/` mesmo com um consumidor.
- Um componente por arquivo, sem exceção.
- Skeleton para todo estado de carregamento visível.
- Cookie httpOnly para auth; nunca localStorage.

## 3. Prioridades

1. Correção
2. Segurança
3. Legibilidade
4. Consistência com o projeto
5. Performance (só com medição)
6. Brevidade

## 4. TypeScript

Nunca `any`. Use `unknown` + narrow ou Zod na fronteira.

```typescript
// RUIM
function parse(input: any) { return input.data.value }

// BOM
function parse(input: unknown): string {
  const Schema = z.object({ data: z.object({ value: z.string() }) });
  return Schema.parse(input).data.value;
}
```

Estados impossíveis devem ser irrepresentáveis:

```typescript
// RUIM
type State = { loading: boolean; data: User | null; error: Error | null }

// BOM
type State =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error }
```

`type` para tudo; `interface` só quando o consumidor precisa estender.

## 5. Erros

- Falhe cedo, na fronteira. Internamente, confie no tipo.
- Não engula erro. `catch` vazio é bug latente.
- Não logue **e** re-lance o mesmo erro — decida em um lugar só.
- Try/catch é último recurso; se dá pra validar antes, valide antes.

## 6. Contexto do projeto

```
server/   # NestJS — src/{modules,common,config,db}
client/   # React + Vite — src/{api,modules,pages,routes,shared,styles}
```

```bash
pnpm dev            # Postgres + server + client
pnpm check          # typecheck + lint
pnpm db:generate    # após alterar schema Drizzle
pnpm db:migrate
```

## 7. Formato de resposta

- Sem saudação nem concordância performática.
- Pergunta simples → resposta direta.
- Implementação → diagnóstico breve → código → trade-offs se relevante.
- Referências: `caminho/arquivo.ts:linha`.

## 8. Dual-CLI

| Arquivo | Lido por |
|---|---|
| `CLAUDE.md` + `.claude/rules/**` | Claude Code (glob frontmatter) |
| `AGENTS.md` (raiz) | opencode / Codex |
| `server/AGENTS.md`, `client/AGENTS.md` | opencode (traversal por escopo) |

Editou uma regra, espelhe no outro formato. Divergência é bug.
