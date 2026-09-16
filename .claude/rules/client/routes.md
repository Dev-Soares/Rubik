---
globs: client/**
---

# Rotas — TanStack Router

Rotas são baseadas em arquivo, em `src/routes/`.

## Convenções

- `__root.tsx` — layout raiz.
- `_auth.tsx` — layout pathless que protege tudo em `routes/_auth/`.
- `index.tsx` — rota exata do diretório (`/`).
- `$param.tsx` — segmento dinâmico.

## Regra dura

**NUNCA** edite ou gere `routeTree.gen.ts` à mão. É gerado pelo plugin `@tanstack/router-plugin/vite` ao rodar `pnpm dev` ou `pnpm build`.

## Arquivo de rota contém APENAS configuração

`createFileRoute`, `beforeLoad`, `loader`, `validateSearch`, e o import do componente de `@/pages/`.

**Nenhum JSX** no arquivo de rota. A UI mora em `pages/`.

```tsx
// RUIM — componente dentro da rota
export const Route = createFileRoute('/_auth/profile')({
  component: () => <div className="p-4">...</div>,
});

// BOM — rota só aponta
export const Route = createFileRoute('/_auth/profile')({
  component: Profile,
});
```

## Ciclo de vida

`beforeLoad` → `loader` → componente.

- Proteção de rota vai em `beforeLoad`, com `redirect()`.
- `loader` usa `context.queryClient.ensureQueryData(...)` e **sempre** com `await`.
- Loader não retorna dados; só garante o cache. O componente lê com `useSuspenseQuery` no mesmo `queryOptions()`.
- `validateSearch` com schema Zod sempre que a rota usa query param.
- Passe `from` no `useNavigate` para tipagem correta.

## Segurança

Checagem de papel no `beforeLoad` é **UX, não segurança**. A autorização real é do backend (`RolesGuard`). Nunca confie só no cliente.
