---
globs: client/**
---

# Frontend — Fluxo de Dados

Fluxo obrigatório, sem atalhos:

```
api  →  service  →  hook  →  component
axios   HTTP+tipo   estado    render
```

**NUNCA** component → axios. **NUNCA** component → service direto. **NUNCA** service chamando hook.

## 1. `api/` — transporte

`api/axios.ts` (instância, `withCredentials`, `getErrorMessage`) e `api/auth-client.ts` (Better Auth). Mais nada. Sem lógica de feature.

## 2. `modules/<feature>/service/` — chamada HTTP tipada

Função pura `async`. Recebe argumentos, devolve dados tipados.

**Não pode:** hook, estado, toast, navegação, `queryClient`.

```typescript
// RUIM — service com efeito de UI
export async function listUsersService() {
  const { data } = await api.get('/users');
  toast.success('Carregado!');   // não
  return data;
}

// BOM — só transporte e tipo
export async function listUsersService(params: {
  limit: number;
  offset: number;
}): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>('/users', { params });
  return data;
}
```

Sempre tipar o genérico do axios (`api.get<T>`), nunca confiar no `any` implícito.

## 3. `modules/<feature>/hooks/` — estado e efeito

Um hook por arquivo, nome `use<Acao><Feature>.ts`.

Aqui mora: TanStack Query/Mutation, `queryKey`, invalidação, `toast`, navegação, tratamento de erro via `getErrorMessage`.

```typescript
// Query — exporte também o queryOptions para reuso em loader de rota
export function usersQueryOptions(page = 0, limit = 20) {
  return queryOptions({
    queryKey: ['users', { page, limit }],
    queryFn: () => listUsersService({ limit, offset: page * limit }),
  });
}

export function useUsers(page = 0, limit = 20) {
  return useSuspenseQuery(usersQueryOptions(page, limit));
}

// Mutation — invalida e avisa
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUserService(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Perfil atualizado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
```

- `isPending`, nunca `isLoading`.
- Invalidar as queries afetadas após mutation.
- O mesmo `queryOptions()` no loader da rota e no componente — uma única fonte de verdade.

## 4. `modules/<feature>/types/` — tipos e schemas

Todo `export type` e todo schema Zod da feature ficam aqui. Nunca no componente, hook ou service.

```
modules/<feature>/types/<feature>.ts   # schema Zod + type inferido + tipos de resposta
shared/types/<nome>.ts                 # tipos compartilhados entre features
```

Type derivado do schema: `export type UpdateUserInput = z.infer<typeof updateUserSchema>`.
