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

- **NUNCA** edite `src/db/migrations/` à mão.
- Alterou schema → `pnpm db:generate`.
- Aplicar → `pnpm db:migrate`.

## Injeção

```typescript
constructor(@Inject(DB) private readonly db: Database) {}
```

`DB` de `src/db/db.provider`, `Database` de `src/db/types/db.types`.
