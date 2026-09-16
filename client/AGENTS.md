# Frontend — React 19 + TanStack Router

## Fluxo de Dados

```
api  →  service  →  hook  →  component
axios   HTTP+tipo   estado    render
```

**NUNCA** component → axios. **NUNCA** component → service direto.

### 1. `api/` — transporte

`axios.ts` (instância, `getErrorMessage`) e `auth-client.ts` (Better Auth). Sem lógica de feature.

### 2. `service/` — chamada HTTP tipada

Função `async` pura. Recebe args, devolve dados tipados.
Não pode: hook, estado, toast, navegação, `queryClient`.

```typescript
// RUIM — efeito de UI no service
export async function listUsersService() {
  const { data } = await api.get('/users');
  toast.success('Carregado!');
  return data;
}

// BOM
export async function listUsersService(params: {
  limit: number;
  offset: number;
}): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>('/users', { params });
  return data;
}
```

Sempre tipar o genérico: `api.get<T>`.

### 3. `hooks/` — estado e efeito

Um hook por arquivo, `use<Acao><Feature>.ts`.
Aqui mora: Query/Mutation, `queryKey`, invalidação, toast, navegação, `getErrorMessage`.

```typescript
export function usersQueryOptions(page = 0, limit = 20) {
  return queryOptions({
    queryKey: ['users', { page, limit }],
    queryFn: () => listUsersService({ limit, offset: page * limit }),
  });
}

export function useUsers(page = 0, limit = 20) {
  return useSuspenseQuery(usersQueryOptions(page, limit));
}
```

`isPending`, nunca `isLoading`. Invalide as queries afetadas após mutation. Mesmo `queryOptions()` no loader e no componente.

### 4. `types/` — tipos e schemas

Todo `export type` e schema Zod da feature aqui. Nunca no componente, hook ou service.
`export type UpdateUserInput = z.infer<typeof updateUserSchema>`.

## Componentes

### Um componente por arquivo

Um `export function <Nome>` por `.tsx`, nome do arquivo = nome do componente.
Precisa de sub-componente? **Novo arquivo.** Dois componentes no mesmo arquivo quebra Fast Refresh.

Contexto e provider também se separam:
```
shared/types/theme.ts              # ThemeContextValue
shared/contexts/themeContext.ts    # createContext
shared/contexts/ThemeProvider.tsx  # provider
shared/hooks/useTheme.ts           # consumidor
```

### Componentes burros

Recebem dados por **props** e renderizam. Não buscam, não decidem regra de negócio.
Não pode: `useQuery`/`useMutation` direto, chamar service ou axios, montar `queryKey`.
Pode: `useState` de campo controlado, `useForm`, handler que chama função vinda de prop/hook.

```tsx
// RUIM
export function UsersTable() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users') });
  return <table>...</table>;
}

// BOM
type UsersTableProps = { users: User[]; currentUserId: string };
export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return <table>...</table>;
}
```

Quem liga hook a componente burro é o **container** (`components/UsersPanel.tsx`) ou a page.
Cadeia: `page → container (hook) → componente burro (props)`.
Exceção: hook de mutation pode ser chamado no componente que dispara a ação.

### Estrutura do arquivo

1. Constantes e helpers → 2. `type <Nome>Props` → 3. componente exportado.

### Props

`type <Nome>Props = {...}` nomeado, nunca inline. Sem `any`. Props de dado separadas de props de ação.

### Instruções

- `useEffect` só para efeito colateral real. Nunca para derivar estado ou buscar dados.
- `React.SyntheticEvent` no `onSubmit`, **não** `FormEvent`.
- Validação no submit (`zodResolver`), não a cada `onChange`.
- Submit desabilitado durante `isPending`.
- Textos de UI em **pt-BR**.

## Rotas — TanStack Router

- **NUNCA** edite `routeTree.gen.ts` (gerado pelo plugin do Vite).
- Arquivo de rota contém **apenas** configuração: `createFileRoute`, `beforeLoad`, `loader`, `validateSearch`, import do componente de `@/pages/`. **Nenhum JSX.**
- Proteção em `beforeLoad` com `redirect()`. Rotas protegidas em `routes/_auth/`.
- `loader` usa `ensureQueryData` com `await`; não retorna dados, só garante cache.
- `validateSearch` com Zod quando a rota usa query param.
- Passe `from` no `useNavigate`.
- Checagem de papel no cliente é **UX, não segurança** — o backend (`RolesGuard`) é a autorização real.

## Estilo — Tailwind v4 + shadcn/ui

Só Tailwind. Zero `style={{}}`, zero `.css` por componente. Único CSS é `styles/global.css`.
Ícones: **`lucide-react`**. Toasts: **`sonner`**.

### shadcn primeiro

Antes de escrever componente de UI genérico, veja se o shadcn já tem: `pnpm ui:add <componente>`.
Instalados em `shared/components/ui/`: `button`, `input`, `label`, `card`, `table`, `skeleton`, `sonner`, `dropdown-menu`, `avatar`, `badge`.

- **NÃO** edite `ui/` à mão — é gerado.
- Precisa variar? Componha por cima em `shared/components/` (ex: `FormField`).
- Botão que navega: `<Button asChild><Link to="/x">…</Link></Button>`.

### Tokens

| Use | Não use |
|---|---|
| `bg-background`, `bg-card`, `bg-muted` | `bg-white`, `bg-gray-100` |
| `text-foreground`, `text-muted-foreground` | `text-black`, `text-gray-500` |
| `border` | `border-gray-200` |
| `bg-primary`, `text-primary-foreground` | `bg-blue-600` |
| `text-destructive` | `text-red-500` |

Token novo → declare em `:root` **e** `.dark`, e mapeie em `@theme inline`.
Tema escuro é automático — não escreva `dark:` em cada classe.
Conflito de classe: `cn()` de `cn`.
Borda em vez de sombra. Espaçamento `gap-4`/`gap-6`.

### Acessibilidade

Input com `label` associado. Erro com `role="alert"` + `aria-describedby`. Botão só-ícone com `aria-label`. Loading com `role="status"`.

## Pastas

```
modules/<Feature>/{components,hooks,service,types,skeletons}
pages/          # uma página por arquivo
shared/{components,layouts,hooks,contexts,types}
```

Componente: PascalCase. Hook: camelCase. Imports internos via alias `@/`.
