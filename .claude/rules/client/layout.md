---
globs: client/**
---

# Layout de páginas e formulários

## Container

Toda página autenticada usa `AppLayout`, que já limita a largura de leitura
(`max-w-3xl`). **Não** crie outro container de largura por cima.

Estrutura padrão:

```tsx
<AppLayout>
  <div className="flex flex-col gap-8">
    <PageHeader title="..." description="..." />
    {/* conteúdo */}
  </div>
</AppLayout>
```

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

## Primitivos disponíveis

Em `shared/components/`: `PageHeader`, `FormSection`, `FormField`, `FormError`,
`SelectField`, `PageSkeleton`, `StatusPage`, `ErrorMessage`, `AppLogo`,
`AppVersion`, `ToggleTheme`.

Em `shared/layouts/`: `AppLayout`, `AuthLayout`, `AppSidebar`, `SidebarToggle`,
`NavGroupItem`, `NavLinkItem`.

Antes de criar um primitivo de página ou form, verifique se já existe aqui.
