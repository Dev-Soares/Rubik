---
globs: client/**
---

# Layout de páginas e formulários

## Container

A casca autenticada (`AppLayout`: sidebar, cabeçalho, sino) é montada **uma vez**
na rota `_auth`, não pela página. A página começa no `PageWidth`, que é o
`<main>` e já limita a largura de leitura (`max-w-3xl`). **Não** crie outro
container de largura por cima.

Estrutura padrão:

```tsx
<PageWidth>
  <div className="flex flex-col gap-8">
    <PageHeader title="..." description="..." />
    {/* conteúdo */}
  </div>
</PageWidth>
```

**Nunca** monte `AppLayout` dentro de uma página. O React só preserva estado
quando o componente na mesma posição é do mesmo tipo: com cada página
renderizando a própria casca, navegar troca o tipo naquela posição e o React
desmonta a subárvore inteira — `SidebarProvider` junto. Era o que fazia a
sidebar recolhida reabrir sozinha a cada navegação, o grupo expandido fechar na
mão do usuário e o `refetchInterval` do sino reiniciar antes de completar.

Tela de duas colunas sobrescreve a largura no próprio `PageWidth`
(`<PageWidth className="max-w-5xl">`), que é quem conhece a tela.

Tela terminal dentro da casca (403, 404, erro de rota filha) passa
`fillViewport={false}` ao `StatusPage`: `min-h-dvh` somaria a altura do
cabeçalho à da viewport e criaria rolagem vertical.

## Regras

- **Título da página**: sempre `PageHeader` (cor primária, descrição opcional).
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

## Formulário em modal

Todo formulário que mora num `Dialog` segue **esta** estrutura. Não é sugestão
de estilo: é o que faz cabeçalho e rodapé ficarem parados enquanto os campos
rolam.

```tsx
// O Dialog — ícone do assunto no cabeçalho, largura pelo `sm:max-w-*`
<DialogContent className="shadow-2xl sm:max-w-lg">
  <DialogHeader icon={IdCardIcon}>
    <DialogTitle className="text-primary text-lg font-black tracking-tight">
      Criar cargo
    </DialogTitle>
    <DialogDescription className="sr-only">
      Defina o nome e o acesso do cargo.
    </DialogDescription>
  </DialogHeader>

  <RoleForm onDone={() => setOpen(false)} />
</DialogContent>

// O form — coluna que ocupa o espaço entre cabeçalho e rodapé
<form onSubmit={...} className="flex min-h-0 flex-1 flex-col">
  <fieldset disabled={isPending} className="contents">
    <DialogBody className="gap-6">
      {/* os campos */}
      <FormError message={error?.message} />
    </DialogBody>

    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="ghost">Cancelar</Button>
      </DialogClose>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Criar cargo'}
      </Button>
    </DialogFooter>
  </fieldset>
</form>
```

### Por que assim

O `DialogContent` é `flex flex-col overflow-hidden` com teto de altura. Quem
rola é **só** o `DialogBody` (`min-h-0 flex-1 overflow-y-auto`); cabeçalho e
rodapé são `shrink-0` e ficam fora da área rolante — por isso não precisam de
`sticky`, e por isso o botão de fechar pode ser `absolute` sem subir junto com
o conteúdo.

`min-h-0` no `<form>` e no `DialogBody` é obrigatório: um filho de flex não
encolhe abaixo do conteúdo por padrão, e sem ele o corpo empurra o modal para
além do `max-h` — quem passa a rolar é a página inteira.

### Regras

- **Nunca** ponha `overflow-y-auto` ou `max-h-*` dentro do corpo. Dois scrolls
  aninhados fazem a roda do mouse travar na borda do elemento interno; quem
  rola é o `DialogBody`, e só ele.
- **Nunca** ponha padding no `DialogContent` — ele vem de cada peça
  (`px-6` em cabeçalho, corpo e rodapé). Com padding no container, as faixas
  não encostam na borda do modal.
- `DialogHeader` leva `icon`: o ícone do assunto, num quadro `bg-primary/10`.
  É o mesmo ícone da aba em `NAV_ITEMS`, quando a tela tiver um.
- Cabeçalho e rodapé **não** têm fundo nem borda próprios — o respiro já separa.
- `gap-6` entre campos (`DialogBody className="gap-6"`); `gap-4` é o padrão do
  corpo para conteúdo que não é formulário.
- `FormError` fica **dentro** do `DialogBody`, no fim — é sobre o que foi
  preenchido, não sobre a ação.
- Botão de submit desabilitado durante `isPending`, com o texto trocando para
  "Salvando...".
- `fieldset className="contents"` envolve tudo: desabilita o formulário inteiro
  sem criar uma caixa no layout.

## Primitivos disponíveis

Em `shared/components/`: `PageWidth`, `PageHeader`, `FormSection`, `FormField`,
`FormError`, `SelectField`, `PageSkeleton`, `StatusPage`, `ErrorMessage`,
`AppLogo`, `AppVersion`, `ToggleTheme`.

Em `shared/components/ui/dialog`: `DialogContent`, `DialogHeader`, `DialogBody`,
`DialogFooter` — as quatro peças da estrutura acima.

Em `shared/layouts/`: `AppLayout`, `AuthLayout`, `AppSidebar`, `SidebarToggle`,
`NavGroupItem`, `NavLinkItem`.

Antes de criar um primitivo de página ou form, verifique se já existe aqui.
