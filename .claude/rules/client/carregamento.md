---
globs: client/**
---

# Estados de carregamento

Todo estado de carregamento visível tem skeleton (`AGENTS.md` §2). Esta rule é
sobre **como** — as três regras abaixo nasceram de bug real nesta base.

## 1. Skeleton espelha a forma do conteúdo, não é retângulo genérico

O skeleton existe para o conteúdo **não saltar** quando chega. Barra chapada no
lugar de uma tabela com cabeçalho e avatar muda a altura de cada linha ao
resolver: a página pula e o rodapé desce. É CLS, e aparece na tela mais usada.

Copie a estrutura real: moldura, cabeçalho, altura de linha, largura de coluna,
e os mesmos breakpoints que escondem coluna no celular.

```tsx
// RUIM — não tem a altura nem a moldura da tabela que vai substituir
<div className="flex flex-col gap-2 rounded-xl border p-4">
  {rows.map((i) => <Skeleton key={i} className="h-12" />)}
</div>

// BOM — mesma moldura, mesmo cabeçalho, mesma altura de linha, mesmos breakpoints
<div className="rounded-xl border">
  <div className="h-12 border-b" />
  {rows.map((i) => (
    <div key={i} className="flex items-center gap-3 border-b px-3 py-4 last:border-b-0 sm:px-5">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="hidden h-4 w-40 sm:block" />
    </div>
  ))}
</div>
```

`TicketListSkeleton` e `UsersTableSkeleton` são os modelos. Card de altura
variável (`RolesGridSkeleton`) monta-se das mesmas peças do card real — nunca um
`h-44` chutado, que erra para mais ou para menos e salta de qualquer jeito.

Skeleton fica em `modules/<feature>/skeletons/`, um arquivo por skeleton.

## 2. Estado que muda a query fica FORA do `<Suspense>`

`useSuspenseQuery` suspende quando a `queryKey` muda e não há dado em cache. Se
o `useState` que compõe a chave mora **dentro** do boundary, trocar de página ou
de filtro desmonta a árvore inteira: a lista pisca, o scroll vai para o topo e o
campo de busca perde o foco no meio da digitação.

```tsx
// RUIM — `page` dentro do Suspense: todo clique em "Próxima" desmonta a tabela
<Suspense fallback={<UsersTableSkeleton />}>
  <UsersPanel />   {/* tem o useState de page aqui dentro */}
</Suspense>

// BOM — filtro fora, só a lista suspende
const [filters, setFilters] = useState<AuditFilters>({});
<>
  <AuditFiltersBar filters={filters} onChange={setFilters} />
  <Suspense fallback={<AuditTimelineSkeleton />}>
    <AuditList filters={filters} />
  </Suspense>
</>
```

`AuditPanel` é o modelo: a barra de filtros sobrevive, só a lista recarrega.

## 3. Paginação não desmonta a lista

Trocar de página com `useSuspenseQuery` e sem mais nada volta ao estado "sem
dado" e cai no fallback. Para paginação, mantenha a página anterior na tela:

```ts
// no queryOptions
placeholderData: keepPreviousData,
```

```tsx
// no componente: esmaece enquanto a nova página vem, sem desmontar
const { data, isFetching } = useUsers(page, PAGE_SIZE);

<div className={cn('transition-opacity', isFetching && 'pointer-events-none opacity-60')}>
  <UsersTable users={data.items} />
</div>
```

`isFetching`, **não** `isPlaceholderData`: o tipo de retorno do
`useSuspenseQuery` remove esse campo de propósito
(`DistributiveOmit<..., 'isPlaceholderData'>`), porque na variante suspense o
primeiro carregamento nunca renderiza sem dado.

Trave os botões de navegação durante o `isFetching` — dois cliques rápidos
pulariam uma página, porque o segundo parte de um `page` que ainda não é o
exibido.

Scroll infinito não precisa disso: `useSuspenseInfiniteQuery` acumula páginas na
mesma chave e só o rodapé mostra carregamento (`AuditList`, `TicketList`).

## 4. Rota pré-carrega o que a primeira tela mostra

Sem `loader`, a tela renderiza, pede o dado e só então desenha: duas esperas em
série onde cabia uma. O `loader` dispara as queries independentes juntas, antes
do primeiro render.

```ts
loader: async ({ context }) => {
  await Promise.all([
    context.queryClient.ensureQueryData(myPermissionsQueryOptions),
    context.queryClient.ensureQueryData(usersQueryOptions(0)),
  ]);
},
```

A chave do loader tem de ser **a mesma** que o componente lê, senão o cache
aquecido não é o consultado — use o default do próprio `queryOptions()` em vez
de repetir o número. Lista infinita usa `ensureInfiniteQueryData`:
`ensureQueryData` grava um formato sem `pages`, que o
`useSuspenseInfiniteQuery` não lê.

## 5. Hook de dado ambiente não suspende o layout

`useMyPermissions` e os contadores do sino usam `useQuery`, não a variante
suspense: eles vivem na casca (sidebar, cabeçalho), e suspender ali congelaria a
aplicação inteira enquanto um contador carrega. Quem consome trata o `isPending`
na própria tela — `HomeShortcuts` devolve `null`, `GuidePanel` devolve skeleton.
