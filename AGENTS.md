# AGENTS.md — Normativo Global

Fonte única das regras detalhadas: `.claude/rules/**`.
Este arquivo é o normativo curto; regra nova vira arquivo em `.claude/rules/`,
nunca uma seção aqui.

> Instrução do usuário > `.claude/rules/**` > este arquivo > preferência do agent

## 0. Antes de responder

1. Identifique o escopo (`server/**`, `client/**`, ambos, neutro).
2. Carregue as rules do escopo pela tabela de roteamento (§7).
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
  Revisar só se Service passar de ~400 linhas **depois** de já ter sido quebrado
  por sub-domínio, ou se a mesma regra aparecer em três services. Não improvise
  uma camada de domínio parcial em um módulo só.
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
- Tailwind v4 + shadcn/ui com token semântico. Sem CSS por componente.
- Docker com paridade dev/prod; Postgres sempre em container.

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

## 7. Roteamento — carregue só o que a tarefa pede

Nada carrega "por precaução". Pela tarefa:

| Tarefa | Leia |
|---|---|
| Endpoint, controller, service, regra de negócio | `.claude/rules/server/architecture.md` |
| Schema, migration, query Drizzle | `.claude/rules/server/db.md` |
| Guard, sessão, papel, permissão | `.claude/rules/server/auth.md` |
| Chamada HTTP, hook, query, mutation | `.claude/rules/client/data-flow.md` |
| Componente React, props, container | `.claude/rules/client/components.md` |
| Página, formulário, `PageHeader`, `FormSection` | `.claude/rules/client/layout.md` |
| Arquivo de rota, `beforeLoad`, `loader` | `.claude/rules/client/routes.md` |
| Tailwind, token, shadcn, responsivo, a11y | `.claude/rules/client/styling.md` |
| Feature nova visível ao usuário | `.claude/rules/client/guide.md` |
| Decidir/mudar arquitetura | §2 deste arquivo — decisão fixa, não reabrir |

Escopo amplo (ex: feature full-stack) → carregue as rules dos dois lados,
não o diretório inteiro.

## 8. Formato de resposta

- Sem saudação nem concordância performática.
- Pergunta simples → resposta direta.
- Implementação → diagnóstico breve → código → trade-offs se relevante.
- Referências: `caminho/arquivo.ts:linha`.

## 9. Onde escrever regra nova

| Tipo | Lugar |
|---|---|
| Regra de código (como escrever) | `.claude/rules/<escopo>/<assunto>.md` |
| Invariante curta, válida em todo escopo | §1 ou §2 deste arquivo |

`.claude/rules/**` é a **fonte única** — Claude Code carrega por `globs:`,
outros harnesses leem via a tabela §7. Não existe cópia para espelhar.
