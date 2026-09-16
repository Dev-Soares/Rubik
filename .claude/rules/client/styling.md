---
globs: client/**
---

# Estilo — Tailwind v4 + shadcn/ui

- **Só Tailwind.** Zero `style={{}}`, zero `.css` por componente, zero styled-components.
- Único CSS é `src/styles/global.css` (tokens do tema).
- Ícones: **`lucide-react`** (`import { TrashIcon } from 'lucide-react'`). Não use outra lib de ícones.
- Toasts: **`sonner`** (`import { toast } from 'sonner'`).

## Componentes — shadcn primeiro

Antes de escrever um componente de UI genérico, **verifique se o shadcn já tem**.

```bash
pnpm ui:add <componente>     # ex: pnpm ui:add dialog
```

Instalados em `src/shared/components/ui/`. Já disponíveis: `button`, `input`, `label`, `card`, `table`, `skeleton`, `sonner`, `dropdown-menu`, `avatar`, `badge`.

- **NÃO** edite arquivos em `ui/` à mão — são gerados e sobrescritos por `pnpm ui:add --overwrite`.
- Precisa de variação? Componha por cima em `shared/components/` (ex: `FormField` = `Label` + `Input` + erro).
- Botão que navega: `<Button asChild><Link to="/x">…</Link></Button>`.

## Tokens

Use os tokens do shadcn, nunca cores cruas:

| Use | Não use |
|---|---|
| `bg-background`, `bg-card`, `bg-muted` | `bg-white`, `bg-gray-100` |
| `text-foreground`, `text-muted-foreground` | `text-black`, `text-gray-500` |
| `border` (usa `--border` por padrão) | `border-gray-200` |
| `bg-primary`, `text-primary-foreground` | `bg-blue-600` |
| `text-destructive`, `bg-destructive` | `text-red-500` |
| `rounded-lg` / `rounded-md` (usa `--radius`) | `rounded-[10px]` |

Token novo → declare em `:root` **e** `.dark` no `global.css`, e mapeie em `@theme inline`.

- Tema escuro é automático pelos tokens — não escreva `dark:` em cada classe.
- Prefira borda a sombra para destacar.
- Espaçamento com `gap-4` / `gap-6`.
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Conflito de classe: use `cn()` de `cn` (`import { cn } from 'cn'`), que resolve via `tailwind-merge`.

## Acessibilidade

- Todo input com `Label` associado (`htmlFor` / `id`).
- Erro de campo com `role="alert"` e `aria-describedby`.
- Botão só com ícone precisa de `aria-label`.
- `aria-invalid` no input com erro — o shadcn já estiliza esse estado.
