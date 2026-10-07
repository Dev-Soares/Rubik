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

### Exceção: adaptador de uma linha

`errorComponent`, `notFoundComponent` e `pendingComponent` recebem as props do
router. Quando a tela de `pages/` precisa de uma prop que o router não passa,
uma arrow de **uma linha** que só injeta esse valor fica na rota:

```tsx
// BOM — adaptador: injeta a prop e delega. Nenhuma marcação própria.
notFoundComponent: () => <NotFound fillViewport={false} />,

// RUIM — isto é componente, não adaptador. Vai para `pages/`.
notFoundComponent: () => (
  <div className="p-8 text-center">
    <h1>Não encontrado</h1>
  </div>
),
```

O corte é: a arrow **delega** para um componente de `pages/` (adaptador, pode) ou
**descreve** a tela com marcação própria (componente, não pode).

`__root.tsx` é o único arquivo com um componente de verdade (`RootLayout`): ele
monta os providers que envolvem a aplicação inteira — tema, tooltip, `Toaster` —
e não corresponde a nenhuma página. Não replique isso em outra rota.

## Ciclo de vida

`beforeLoad` → `loader` → componente.

- Proteção de rota vai em `beforeLoad`, com `redirect()`.
- `loader` usa `context.queryClient.ensureQueryData(...)` e **sempre** com `await`.
- Loader não retorna dados; só garante o cache. O componente lê com `useSuspenseQuery` no mesmo `queryOptions()`.
- `validateSearch` com schema Zod sempre que a rota usa query param.
- Passe `from` no `useNavigate` para tipagem correta.

## Segurança

Checagem de papel no `beforeLoad` é **UX, não segurança**. A autorização real é do backend (`RolesGuard`). Nunca confie só no cliente.
