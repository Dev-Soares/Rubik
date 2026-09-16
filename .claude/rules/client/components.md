---
globs: client/**
---

# Componentes React

## Um componente por arquivo

Um `export function <Nome>` por arquivo `.tsx`, nome do arquivo = nome do componente (PascalCase).

Precisa de sub-componente? **Novo arquivo.** Não declare dois componentes no mesmo arquivo — quebra Fast Refresh e esconde responsabilidade.

```
// RUIM — Admin.tsx com dois componentes
function UsersPanel() { ... }
export function Admin() { ... }

// BOM
components/UsersPanel.tsx   ->  export function UsersPanel()
pages/Admin.tsx             ->  export function Admin()
```

Contexto e provider também se separam:
```
shared/types/theme.ts         # ThemeContextValue
shared/contexts/themeContext.ts    # createContext
shared/contexts/ThemeProvider.tsx  # o provider
shared/hooks/useTheme.ts           # o consumidor
```

## Componentes burros

Componente recebe dados por **props** e renderiza. Não busca, não decide regra de negócio.

**Não pode:** `useQuery`/`useMutation` direto, chamar service, chamar axios, montar `queryKey`.

**Pode:** `useState` de campo controlado, `useForm`, handler que chama uma função vinda de hook/prop.

```tsx
// RUIM — componente burro que não é burro
export function UsersTable() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users') });
  return <table>...</table>;
}

// BOM — dados entram por prop
type UsersTableProps = {
  users: User[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return <table>...</table>;
}
```

Quem conecta hook a componente burro é o **container**: um componente em `components/` (ex: `UsersPanel`) ou a `page`. A cadeia é `page → container (hook) → componente burro (props)`.

Exceção única: hook de mutation pode ser chamado no componente que dispara a ação (ex: botão de deletar em `UsersTable`), porque a ação nasce ali.

## Estrutura interna do arquivo

Nesta ordem:
1. Constantes e helpers do módulo
2. `type <Nome>Props`
3. O componente exportado

## Props

- Sempre `type <Nome>Props = {...}` nomeado, nunca inline na assinatura.
- Props tipadas explicitamente — sem `any`, sem `object`.
- Props de dado (`users`, `user`) separadas de props de ação (`onDelete`).

## Instruções

- Não misture JSX com lógica de fetching/estado complexo — extraia para hook ou container.
- `useEffect` só para efeito colateral real (sincronizar com o DOM, subscription). Nunca para derivar estado ou buscar dados.
- `React.SyntheticEvent` no `onSubmit`, **não** `FormEvent`.
- Validação no submit (via `zodResolver`), não a cada `onChange`.
- Botão de submit desabilitado durante `isPending`.
- Textos de UI em **pt-BR**.

## Pastas

```
modules/<Feature>/
  components/   # componentes da feature (um por arquivo)
  hooks/        # um hook por arquivo
  service/      # chamadas HTTP
  types/        # tipos e schemas Zod
  skeletons/    # estados de loading

pages/          # uma página por arquivo, compõe layout + containers
shared/
  components/   # genéricos, reusáveis, sem regra de negócio (Button, Input)
  layouts/      # AppLayout, AuthLayout, Header
  hooks/        # hooks compartilhados
  contexts/     # contexto + provider (arquivos separados)
  types/        # tipos compartilhados
```

Arquivo de componente: PascalCase. Hook: camelCase. Imports internos sempre via alias `@/`.
