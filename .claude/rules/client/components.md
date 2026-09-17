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
  utils/        # função pura da feature
  skeletons/    # estados de loading

pages/          # uma página por arquivo, compõe layout + containers
shared/
  components/   # genéricos, reusáveis, sem regra de negócio (Button, Input)
  layouts/      # AppLayout, AuthLayout, Header
  hooks/        # hooks compartilhados
  contexts/     # contexto + provider (arquivos separados)
  types/        # tipos compartilhados
  utils/        # função pura compartilhada
```

Arquivo de componente: PascalCase. Hook: camelCase. Imports internos sempre via alias `@/`.

### `shared/` é só o que duas features usam

`shared/` não é pasta de "código genérico": é pasta de **código compartilhado**.
Arquivo com **um** consumidor mora dentro da feature que o consome — component,
hook, type, util, tanto faz. Sobe para `shared/` quando o segundo consumidor
aparecer, não por antecipação.

```
// BOM — um consumidor: fica na feature
modules/roles/utils/screens.ts
modules/roles/types/role.ts

// BOM — dois ou mais: sobe
shared/utils/roles.ts          # useAuth + RoleBadge + UsersTable
shared/components/FormField.tsx

// RUIM — genérico no nome, único no uso
shared/utils/screens.ts        # só roles usa
```

Exceções — ficam em `shared/` mesmo com um consumidor, porque existem para serem
aplicadas em qualquer tela (o contador de imports não mede isso):

- `shared/components/ui/` — gerado por `pnpm ui:add`, nunca editado à mão.
- `shared/layouts/` — casca da aplicação (`AppLayout`, `AppSidebar`, `navigation.ts`).
- `shared/contexts/`, `shared/hooks/` de infra — tema, viewport, debounce.
- Primitivos de form e página do template: `FormField`, `FormError`,
  `FormSection`, `PageHeader`, `SelectField`, `PageSkeleton`.

A regra vale para **código de domínio**: type, util, service, component de
feature. Esse desce para o módulo quando tem um consumidor só.

### Função pura — `utils/`

Função pura (sem hook, sem estado, sem JSX) não fica solta no topo de um
componente nem de um service. Vai para `utils/`, na feature ou em `shared/` pela
regra acima.

- Um assunto por arquivo (`roles.ts`, `screens.ts`), nunca um `utils.ts` depósito.
- Mesma transformação em dois componentes → extraia e troque os dois.

**O corte é transformação de dado vs. formatação de apresentação.** Não é
"exportado ou não": helper privado que reestrutura dado também sai.

```
// SAI para utils/ — reestrutura dado, é testável sozinho
groupByDay(entries)          -> modules/audit/utils/timeline.ts
toAccessByScreen(screens)    -> modules/roles/utils/screens.ts
nextOffset(lastPage)         -> modules/audit/utils/timeline.ts

// FICA no arquivo — formata para exibir, só faz sentido ali
getInitials(name)            # UserAvatar.tsx
accessOptions(inherited)     # UserScreenAccessRow.tsx
new Intl.DateTimeFormat(...) # constante de módulo
```

Em dúvida: se a função faria sentido num teste unitário sem o componente, vai
para `utils/`.

## Layout de páginas e formulários

Toda página autenticada usa `AppLayout`, que já limita a largura de leitura
(`max-w-3xl`). Não crie outro container de largura por cima.

Estrutura padrão de uma página:

```tsx
<AppLayout>
  <div className="flex flex-col gap-8">
    <PageHeader title="..." description="..." />
    {/* conteúdo */}
  </div>
</AppLayout>
```

- **Título da página**: sempre `PageHeader` (cor primária, com descrição opcional).
  Nunca um `<h1>` solto.
- **Seções de formulário**: sempre `FormSection` — título e descrição **acima**
  dos campos, nunca ao lado.
- **Não** coloque `max-w-*` no `<form>`: quem controla a largura é a `FormSection`.
- Separe seções dentro do mesmo card com `<Separator />` e `gap-8`.
- Ação da página (ex: "Novo usuário") fica na mesma linha do `PageHeader`,
  alinhada à direita.

```tsx
// BOM
<Card>
  <CardContent className="flex flex-col gap-8">
    <FormSection title="Dados da conta" description="Como seu nome aparece.">
      <ProfileForm ... />
    </FormSection>
    <Separator />
    <FormSection title="Senha" description="...">
      <ChangePasswordForm />
    </FormSection>
  </CardContent>
</Card>
```
