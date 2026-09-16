---
globs: server/**
---

# Backend — Separação de Camadas

Fluxo obrigatório, sem atalhos:

```
Controller  →  Service  →  Drizzle (db)
   HTTP        negócio      persistência
```

**NUNCA** Controller → `db` direto. **NUNCA** Service tocando `Request`/`Response`.

## Controller — apenas HTTP

Responsabilidade única: traduzir HTTP ↔ Service.

Pode: rotas (`@Get`, `@Post`), status (`@HttpCode`), guards (`@UseGuards`), extrair input (`@Body`, `@Param`, `@Query`), Swagger (`@ApiTags`, `@ApiOkResponse`).

**Não pode:** query de banco, regra de negócio, `if` que decide negócio, try/catch de domínio, transformar dados.

```typescript
// RUIM — regra de negócio e banco no controller
@Get(':id')
async findOne(@Param('id') id: string) {
  const [row] = await this.db.select().from(user).where(eq(user.id, id));
  if (!row) throw new NotFoundException('Usuário não encontrado.');
  if (row.banned) throw new ForbiddenException('Usuário banido.');
  return row;
}

// BOM — controller fino, uma linha
@Get(':id')
findOne(@Param('id') id: string): Promise<PublicUser> {
  return this.usersService.findOne(id);
}
```

Controller não precisa ser `async` se só repassa a Promise do service.

## Service — apenas negócio

Responsabilidade única: regra de negócio + persistência via Drizzle.

Pode: queries Drizzle, validar invariantes, lançar exceptions do Nest, orquestrar outros services.

**Não pode:** conhecer `Request`, `Response`, cookies, headers, status HTTP. Recebe primitivos/DTOs, devolve dados.

```typescript
// RUIM — service acoplado ao HTTP
async findOne(req: Request) {
  const id = req.params.id;
  ...
}

// BOM — service recebe o que precisa
async findOne(id: string): Promise<PublicUser> {
  const [found] = await this.db.select(publicColumns).from(user).where(eq(user.id, id)).limit(1);
  if (!found) {
    throw new NotFoundException('Usuário não encontrado.');
  }
  return found;
}
```

Exceptions do Nest (`NotFoundException`, `ForbiddenException`, `ConflictException`) são permitidas no service — o `AllExceptionsFilter` as converte em HTTP.

## Types — só em `types/`

Todo `export type` fica em `<escopo>/types/<nome>.types.ts`. Nunca no topo de um service, controller ou provider.

```
src/modules/users/types/user.types.ts     # PublicUser
src/common/types/pagination.types.ts      # Paginated<T>
src/auth/types/auth.types.ts              # Session, User
src/db/types/db.types.ts                  # Database
```

Exceção: `type` local **não exportado**, usado só naquele arquivo, pode ficar no arquivo.

## DTOs — só validação de entrada

`dto/` contém classes com `class-validator` + `@ApiProperty`. É input, não type de retorno. Retorno é `type` em `types/`.

- Toda mensagem de erro em **pt-BR**.
- Todo campo com decorator de validação — sem campo solto.

## Um arquivo por responsabilidade

```
modules/<feature>/
  <feature>.controller.ts    # HTTP
  <feature>.service.ts       # negócio
  <feature>.module.ts        # wiring
  dto/<acao>-<feature>.dto.ts
  types/<feature>.types.ts
```

Uma classe exportada por arquivo. Service com 400 linhas → quebrar em services menores por sub-domínio, não em regiões do mesmo arquivo.

## Regras gerais

- **Nunca** `process.env` — importe `env` de `src/config/env.ts`. Exceção: `drizzle.config.ts`.
- **Nunca** `console.log` — use o logger do `nestjs-pino`.
- **Nunca** `any`. Use `unknown` + narrow, ou Zod.
- **Nunca** `as string` para forçar tipo.
- Imports absolutos via `src/...`, nunca `../../..`.
- Early return em vez de aninhar `if`.
