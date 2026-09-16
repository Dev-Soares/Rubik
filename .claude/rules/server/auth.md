---
globs: server/**
---

# Autenticação — Better Auth

Better Auth serve `/auth/*` como middleware Express (montado em `main.ts` **antes** de qualquer body parser). Não existe auth.service próprio, nem JWT manual, nem bcrypt.

## Guards

- `AuthGuard` é **global** (`APP_GUARD`). Toda rota exige sessão por padrão.
- Rota pública → `@Public()`.
- Rota por papel → `@Roles('admin')` + `@UseGuards(RolesGuard)`.
- Rota de recurso próprio → `@UseGuards(OwnershipGuard)` (compara `:id` com o usuário da sessão; admin passa).

## Sessão

- No handler: `@CurrentUser()` ou `@CurrentUser('id')`.
- Nunca leia cookie/header de auth à mão — o `AuthGuard` já resolveu e anexou `req.user` / `req.session`.
- Campo extra no usuário → `additionalFields` do Better Auth. **Não** crie um domínio User paralelo.

## Segurança — inegociável

- Cookie `httpOnly`; **nunca** token em localStorage.
- Segredo só em `env`, nunca no código, log ou response.
- Nunca retorne `password`, `token` ou hash em nenhum endpoint.
- Validação de todo input externo na fronteira (DTO ou Zod), antes da lógica.
