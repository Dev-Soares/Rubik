---
globs: server/**
---

# Banco — Drizzle ORM

## Schema

- Tabelas em `src/db/schema/<dominio>.ts`, reexportadas em `schema/index.ts`.
- Nome da tabela: **singular**, `lower_snake_case`.
- **SEMPRE** `createdAt` e `updatedAt` (`timestamp` com `withTimezone: true`).
- `updatedAt` com `.$onUpdate(() => new Date())`.
- FK com `.references(() => other.id, { onDelete: 'cascade' })`.
- Índice em toda coluna de FK usada em filtro.

## Queries

Só dentro de Services (ou de um controller trivial de health).

- `.returning()` em INSERT/UPDATE/DELETE quando precisa do resultado.
- `.limit(1)` em busca de item único, destructure: `const [row] = await ...`.
- `.set()` / `.values()` **nunca** incluem `id`, `createdAt`, `updatedAt`.
- Selecione colunas explícitas (objeto `publicColumns`) — nunca `select()` cru em tabela com campo sensível (ex: `password`).
- Transações com `db.transaction(async (tx) => {...})`; use `tx`, não `db`, dentro dela.

## Migrations

- Alterou schema → `pnpm db:generate`. Aplicar → `pnpm db:migrate`.
- **Nunca edite uma migration já aplicada.** O histórico é imutável: corrigir
  algo que já rodou é uma migration NOVA.
- **Migration de schema é gerada**, nunca escrita à mão: o `db:generate` mantém
  o snapshot em `meta/` em sincronia, e é o snapshot que o próximo
  `db:generate` usa para calcular o diff.
- **Migration de DADOS é escrita à mão** — backfill, rename preservando o que
  já existe, correção de linha. O gerador não sabe transformar dado: para um
  rename ele emite DROP + CREATE e leva embora o que o usuário configurou.
  Nesse caso: escreva o `.sql`, explique no cabeçalho por que não é gerado, e
  **registre a entrada no `meta/_journal.json`** (`idx`, `version`, `when`,
  `tag`, `breakpoints`) — sem ela o arquivo não roda.
  - `0011_cargos_modulo_acao.sql` é o exemplo no repo: RENAME com `unnest` para
    remapear as permissões antigas, porque DROP/CREATE apagaria toda exceção
    configurada.
  - Migration de dados escrita à mão não gera snapshot. Se o `db:generate`
    seguinte abrir prompt interativo pedindo para resolver rename, é esse o
    motivo — o diff está sendo calculado contra o último snapshot, que é
    anterior à sua migration.
- `IF NOT EXISTS` em `CREATE INDEX` escrito à mão: quem rodou `db:push` em dev
  pode já ter o objeto fora do versionamento.

## Injeção

```typescript
constructor(@Inject(DB) private readonly db: Database) {}
```

`DB` de `src/db/db.provider`, `Database` de `src/db/types/db.types`.
