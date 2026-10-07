# AGENTS.md — Normativo Global

Fonte única das regras detalhadas: `.claude/rules/**`.
Este arquivo é o normativo curto; regra nova vira arquivo em `.claude/rules/`,
nunca uma seção aqui.

> Instrução do usuário > `.claude/rules/**` > este arquivo > preferência do agent

## 0. Antes de responder

1. Identifique o escopo (`server/**`, `client/**`, ambos, neutro).
2. Carregue as rules do escopo pela tabela de roteamento (§7).
3. Inspecione 1-2 arquivos vizinhos antes de gerar código.
4. Vai **rodar** a aplicação? Confira o ambiente primeiro (§6) — `pnpm dev`
   não precisa de nada, `pnpm dev:local` exige `pnpm setup`. Erro de variável
   de ambiente no boot quase sempre é setup que não rodou, não configuração
   errada: não invente `.env` à mão.

## 1. Checklist de entrega [OBRIGATÓRIO]

- [ ] Camadas respeitadas:
  - server: `Controller → Service → Drizzle`. **Nunca** Controller→db.
  - client: `api → service → hook → component`. **Nunca** component→axios.
- [ ] Todo `export type` em `types/`. Nenhum tipo exportado solto em service/controller/componente.
      Exceção: tipo que descreve a **interface do próprio arquivo** e não viaja
      como dado — opção de um campo genérico (`SelectOption`), payload de um
      decorator (`AccessRequirement`). Tipo de domínio sai sempre.
- [ ] Toda função pura em `utils/`. No arquivo do service/componente só o mapper
      de row e formatação de apresentação não exportada.
- [ ] Domínio com um único consumidor mora no módulo dele — não em `common/`/`shared/`.
- [ ] Um componente por arquivo `.tsx`. Uma classe exportada por arquivo `.ts`.
      Exceção: DTO aninhado exigido por `@ValidateNested` acompanha o DTO pai
      (`PermissionOverrideDto` em `set-user-permissions.dto.ts`) — separar quebra
      a validação, que resolve a classe pelo `@Type(() => ...)`.
- [ ] Componentes recebem dados por props; não buscam dados.
- [ ] Sem `any`; `unknown` + narrow ou Zod na fronteira.
- [ ] Input externo validado por schema/DTO antes da lógica.
- [ ] Sem secret/token em código, log ou response.
- [ ] Mensagens de erro e textos de UI em **pt-BR**.
- [ ] Frontend: zero `style={{}}`, zero CSS por componente. Tailwind v4 com tokens semânticos.
- [ ] Backend: erros via exceptions do Nest, nunca string genérica.
- [ ] Sem feature/validação/log que o usuário não pediu.
- [ ] Corrigiu bug que não estava catalogado? Entrada em `.claude/rules/licoes.md`.
- [ ] `pnpm check` passa.

## 2. Decisões fixas (não reabrir)

- Backend NestJS, ORM Drizzle, auth Better Auth.
- Frontend TanStack Router (file-based) + TanStack Query.
- Sem camada de domínio/DDD. Regra de negócio mora no Service.
  Revisar só se Service passar de ~400 linhas **depois** de já ter sido quebrado
  por sub-domínio, ou se a mesma regra aparecer em três services. Não improvise
  uma camada de domínio parcial em um módulo só.
- Types **sempre** em `types/`, nunca no arquivo que os usa. Exceção única: tipo
  que descreve a interface do próprio arquivo e não viaja como dado (ver §1).
- Função pura **sempre** em `utils/`, nunca solta no arquivo do service/componente.
  Exceções: mapper de row da feature (`toPublicRole`) e formatação de apresentação
  não exportada (`getInitials`). Transformação de dado sai sempre.
- `common/` (server) e `shared/` (client) = código de domínio com 2+ consumidores.
  Um só → fica no módulo. Infra transversal (guard, pipe, filter, interceptor,
  layout, `ui/`) fica em `common/`/`shared/` mesmo com um consumidor.
- Um componente por arquivo `.tsx`, sem exceção. Para classe `.ts`, a única
  exceção é o DTO aninhado do `@ValidateNested` (ver §1).
- Skeleton para todo estado de carregamento visível, espelhando a forma do
  conteúdo real (`.claude/rules/client/carregamento.md`).
- Cookie httpOnly para auth; nunca localStorage.
- Tailwind v4 + shadcn/ui com token semântico. Sem CSS por componente.
- Docker com paridade dev/prod; Postgres sempre em container.
- **Idioma único pt-BR, sem camada de i18n.** Texto de UI e mensagem de erro vão
  literais no código, em pt-BR. Sem `react-i18next`, sem arquivo de tradução,
  sem `t('chave')`. Os projetos que nascem daqui atendem um público só; uma
  camada de i18n "por precaução" cobra chave em vez de frase em cada componente
  e nunca ganha o segundo idioma que a justificaria. Se um projeto derivado
  precisar mesmo de dois idiomas, i18n entra lá inteira — não meia, e não aqui.
- **Template não versiona.** `client/package.json` fica em `1.0.0`, e o rodapé da
  sidebar mostra esse número. Versão é assunto do projeto derivado: quem nasce
  daqui decide o próprio esquema de bump e release. Não há portão de CI cobrando
  bump, e não adicione um aqui.
- **Template não tem teste automatizado, e isso é decisão.** Sem `jest`, sem
  `supertest`, sem `@nestjs/testing`, sem script `test` — foram removidos de
  propósito. Não os reinstale "para começar certo": o que valia era o dilema
  anterior, em que o aparato estava instalado, zero teste existia e nenhuma
  regra dizia o que testar. Aparato sem política é pior que ausência, porque
  sugere um portão que não existe.
  Os portões aqui são `pnpm check` (typecheck + lint) e o CI, que ainda roda
  build e aplica as migrations contra base limpa. Projeto derivado que queira
  testar decide o próprio escopo e instala lá — e aí escreve a regra junto.
  Onde as rules dizem "testável sozinha" (`architecture.md`, `components.md`),
  é critério de ONDE o código mora, não obrigação de escrever teste.

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
pnpm dev            # Postgres + server + client, tudo em container
pnpm check          # typecheck + lint
pnpm db:generate    # após alterar schema Drizzle
pnpm db:migrate
```

### Primeira vez neste dispositivo

Há dois caminhos para subir a aplicação, e só um precisa de preparo:

| Caminho | Precisa de `pnpm setup`? |
|---|---|
| `pnpm dev` — tudo em container | **Não.** A config vem do compose, e o container aplica migrations e cria o admin antes de subir a API. |
| `pnpm dev:local` — Postgres em container, app no host | **Sim.** Precisa de `server/.env` e das dependências instaladas na máquina. |

```bash
pnpm setup          # idempotente: cria os `.env` com segredos aleatórios,
                    # instala deps, sobe o Postgres, migra e cria o admin.
                    # Não sobrescreve `.env` existente.
pnpm hooks:install  # liga o pre-push local (typecheck + lint). Uma vez por clone.
```

**Sintoma de setup que não rodou:** o boot morre com `[env] <VAR>: ...` e
`exit 1` — o server lê `process.env` direto (`config/env.ts`), valida com Zod e
aborta no primeiro campo faltando. A resposta é `pnpm setup`, não escrever
`server/.env` à mão: o script gera `BETTER_AUTH_SECRET` e
`INTEGRATION_API_KEY` com `randomBytes(32)`, e segredo inventado por engano
vira segredo fraco em commit.

## 7. Roteamento — carregue só o que a tarefa pede

Nada carrega "por precaução". Pela tarefa:

| Tarefa | Leia |
|---|---|
| **Qualquer tarefa que escreve código** | `.claude/rules/engenharia-minima.md` |
| **Corrigir bug** | `.claude/rules/licoes.md` — antes de investigar e ao registrar o fix |
| Endpoint, controller, service, regra de negócio | `.claude/rules/server/architecture.md` |
| Schema, migration, query Drizzle | `.claude/rules/server/db.md` |
| Guard, sessão, papel, permissão | `.claude/rules/server/auth.md` |
| Chamada HTTP, hook, query, mutation | `.claude/rules/client/data-flow.md` |
| Componente React, props, container | `.claude/rules/client/components.md` |
| Página, formulário, `PageHeader`, `FormSection` | `.claude/rules/client/layout.md` |
| Skeleton, `Suspense`, paginação, `loader` de pré-carga | `.claude/rules/client/carregamento.md` |
| Arquivo de rota, `beforeLoad`, `loader` | `.claude/rules/client/routes.md` |
| Tailwind, token, shadcn, responsivo, a11y | `.claude/rules/client/styling.md` |
| Feature nova visível ao usuário | `.claude/rules/client/guide.md` |
| Log, erro, correlação, observabilidade | `.claude/rules/observabilidade.md` |
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
| Regra de código de um escopo | `.claude/rules/<escopo>/<assunto>.md` (com `globs:`) |
| Regra de código válida nos dois escopos | `.claude/rules/<assunto>.md` (sem `globs:`) + linha na tabela §7 |
| Invariante curta, sem exemplo | §1 ou §2 deste arquivo |
| Bug que já aconteceu + como evitar | `.claude/rules/licoes.md` |

`.claude/rules/**` é a **fonte única** — Claude Code carrega por `globs:`,
outros harnesses leem via a tabela §7. Não existe cópia para espelhar.

Rule sem `globs:` **não** é carregada automaticamente: ela depende da tabela §7.
Criou uma, registre lá no mesmo commit.
