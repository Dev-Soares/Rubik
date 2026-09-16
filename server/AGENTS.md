# Backend — NestJS + Drizzle + Better Auth

## Separação de Camadas

```
Controller  →  Service  →  Drizzle (db)
   HTTP        negócio      persistência
```

**NUNCA** Controller → `db` direto. **NUNCA** Service tocando `Request`/`Response`.

### Controller — apenas HTTP

Pode: rotas, status, guards, extrair input (`@Body`/`@Param`/`@Query`), Swagger.
Não pode: query de banco, regra de negócio, transformação de dados.

```typescript
// RUIM
@Get(':id')
async findOne(@Param('id') id: string) {
  const [row] = await this.db.select().from(user).where(eq(user.id, id));
  if (!row) throw new NotFoundException('Usuário não encontrado.');
  return row;
}

// BOM
@Get(':id')
findOne(@Param('id') id: string): Promise<PublicUser> {
  return this.usersService.findOne(id);
}
```

### Service — apenas negócio

Pode: Drizzle, invariantes, exceptions do Nest, orquestrar outros services.
Não pode: conhecer `Request`, `Response`, cookies, headers, status HTTP.

Recebe primitivos/DTOs, devolve dados.

### Types — só em `types/`

Todo `export type` em `<escopo>/types/<nome>.types.ts`:

```
src/modules/users/types/user.types.ts     # PublicUser
src/common/types/pagination.types.ts      # Paginated<T>
src/auth/types/auth.types.ts              # Session, User
src/db/types/db.types.ts                  # Database
```

Exceção: `type` local não exportado pode ficar no arquivo.

### DTOs

`dto/` = validação de **entrada** (`class-validator` + `@ApiProperty`). Retorno é `type` em `types/`.
Toda mensagem de erro em **pt-BR**. Todo campo com decorator.

### Um arquivo por responsabilidade

```
modules/<feature>/
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
  dto/<acao>-<feature>.dto.ts
  types/<feature>.types.ts
```

Uma classe exportada por arquivo.

## Banco — Drizzle

- Tabela: **singular**, `lower_snake_case`. Sempre `createdAt`/`updatedAt` com timezone.
- `.returning()` em INSERT/UPDATE/DELETE. `.limit(1)` + `const [row]` em item único.
- `.set()`/`.values()` nunca incluem `id`, `createdAt`, `updatedAt`.
- Colunas explícitas — nunca `select()` cru em tabela com campo sensível.
- **NUNCA** edite `src/db/migrations/`. Alterou schema → `pnpm db:generate`.
- Transação: `db.transaction(async (tx) => ...)`, use `tx` dentro.
- Injeção: `constructor(@Inject(DB) private readonly db: Database) {}`

## Auth — Better Auth

Serve `/auth/*` como middleware Express (montado antes de body parser). Sem JWT manual, sem bcrypt, sem auth.service próprio.

- `AuthGuard` é global — toda rota exige sessão. Pública → `@Public()`.
- Papel → `@Roles('admin')` + `@UseGuards(RolesGuard)`.
- Recurso próprio → `@UseGuards(OwnershipGuard)`.
- Sessão no handler → `@CurrentUser()`. Nunca leia cookie à mão.
- Campo extra no usuário → `additionalFields`, não domínio User paralelo.

### Segurança — inegociável

Cookie `httpOnly`, nunca localStorage. Segredo só em `env`. Nunca retorne `password`/hash/token. Todo input externo validado na fronteira.

## Regras gerais

- **Nunca** `process.env` — importe `env` de `src/config/env.ts` (exceto `drizzle.config.ts`).
- **Nunca** `console.log` — use o logger do `nestjs-pino`.
- **Nunca** `any`, **nunca** `as string`.
- Imports absolutos via `src/...`.
- Early return em vez de aninhar `if`.
- `pnpm check` antes de entregar.
