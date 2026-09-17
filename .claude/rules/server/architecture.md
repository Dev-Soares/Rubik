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
src/modules/auth/types/auth.types.ts      # Session, User
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
  utils/<assunto>.utils.ts   # função pura da feature
```

Uma classe exportada por arquivo. Service com 400 linhas → quebrar em services menores por sub-domínio, não em regiões do mesmo arquivo.

## `common/` é só o que dois módulos usam

`common/` não é pasta de "código genérico": é pasta de **código compartilhado**.
Arquivo com **um** consumidor mora dentro do módulo que o consome, sempre — dto,
type, util, tanto faz. Sobe para `common/` quando o segundo consumidor aparecer,
não por antecipação.

```
// BOM — um consumidor: fica no módulo
modules/roles/utils/screens.utils.ts     # só roles mexe com telas
modules/roles/types/role.types.ts

// BOM — dois ou mais: sobe
common/types/pagination.types.ts         # audit, roles, users
common/dto/pagination.dto.ts             # audit, roles, users
common/utils/roles.utils.ts              # roles.service + RolesGuard

// RUIM — genérico no nome, único no uso
common/utils/screens.utils.ts            # só roles importa
common/types/report.types.ts             # só reports importa
```

Exceção: **infra transversal** (`guards/`, `pipes/`, `filters/`,
`interceptors/`, `decorators/`) fica em `common/` mesmo com um consumidor só —
existe para ser aplicada em qualquer rota, e o contador de imports não mede isso.
`OwnershipGuard` é o caso: hoje só `users` usa, e o lugar dele é `common/guards/`.

## Função pura — `utils/`

**Nunca** declare função solta no mesmo arquivo de um service. Service exporta
uma classe e nada mais. Função pura (sem `db`, sem estado, sem injeção) mora em
`utils/<assunto>.utils.ts` — no módulo, ou em `common/` pela regra acima —,
reexportada pelo `utils/index.ts` do mesmo nível com export nomeado.

```typescript
// RUIM — helper solto no service, invisível para os outros
// roles.service.ts
function parseScreens(value: string | null): Screen[] { ... }

@Injectable()
export class RolesService { ... }

// BOM
// modules/roles/utils/screens.utils.ts
export function parseScreens(value: string | null | undefined): Screen[] { ... }

// roles.service.ts
import { parseScreens } from 'src/modules/roles/utils';
```

Regras:
- Um assunto por arquivo (`roles.utils.ts`, `screens.utils.ts`), nunca um
  `utils.ts` genérico virando depósito.
- Util não injeta dependência nem toca `db`: se precisa do banco, é método de service.
- Achou a mesma transformação em dois lugares (guard e service, por exemplo) →
  extraia para util e troque os dois. Duplicata é bug latente.
- Exceção única: mapper de row para o tipo público da própria feature
  (`toPublicRole`, `toEntry`) fica no service — é a tradução da borda dele.
  Qualquer outra função sai, exportada ou não.

```typescript
// FICA no service — mapper da borda, 1:1 com a tabela da feature
function toPublicRole(row: RoleRow): PublicRole { ... }

// SAI para utils/ — regra sobre o dado, testável sozinha
function applyScreenOverrides(inherited, overrides) { ... }
function toLikePattern(term) { ... }
```

Em dúvida: se a função faria sentido num teste unitário sem o service, vai para `utils/`.

No client a regra é a mesma, com `shared/` no papel de `common/`:
`modules/<feature>/utils/` primeiro, `shared/utils/` quando compartilhado.

## Regras gerais

- **Nunca** `process.env` — importe `env` de `src/config/env.ts`. Exceção: `drizzle.config.ts`.
- **Nunca** `console.log` — use o logger do `nestjs-pino`.
- **Nunca** `any`. Use `unknown` + narrow, ou Zod.
- **Nunca** `as string` para forçar tipo.
- Imports absolutos via `src/...`, nunca `../../..`.
- Early return em vez de aninhar `if`.
