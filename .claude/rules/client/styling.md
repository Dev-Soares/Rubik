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

Instalados em `src/shared/components/ui/`: `alert-dialog`, `avatar`, `badge`,
`button`, `card`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `input`,
`label`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`,
`switch`, `table`, `tabs`, `toggle`, `toggle-group`, `tooltip`.

**Widget com papel ARIA tem contrato de teclado — use o primitivo.** `role="tab"`
promete seta, Home e End com um ponto de parada só no Tab; `role="menu"`,
`role="dialog"` e `role="combobox"` têm cada um o seu. Escrever o papel à mão e
não implementar o teclado é pior que não ter papel nenhum, porque o leitor de
tela passa a anunciar uma interação que não existe. O Radix (via `pnpm ui:add`)
já traz esses contratos — foi o que `TicketStatusTabs` passou a usar.

Esta lista sai de `ls client/src/shared/components/ui/` — em dúvida, confira lá.

- **NÃO** edite arquivos em `ui/` à mão — são gerados e sobrescritos por `pnpm ui:add --overwrite`.
  - Exceção: `ui/dialog.tsx` foi alterado de propósito (cabeçalho e rodapé
    parados, `DialogBody` rolando, `icon` no cabeçalho —
    `.claude/rules/client/layout.md`). **Não** rode `pnpm ui:add dialog
    --overwrite`: o comando devolveria o shadcn cru e quebraria todo
    formulário em modal do sistema.
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

### Exceção: cor que é dado, não decisão de tema

A tabela acima vale para a aparência do sistema. Não vale para **cor escolhida
pelo usuário** nem para **paleta de categoria**, onde o valor é o dado em si:

- `ROLE_COLOR_*` (`modules/roles/utils/badge.ts`) — o administrador escolhe a
  cor do crachá numa lista fixa. Tokenizar significaria um token por cor
  oferecida, e a cor não quer dizer nada sobre o tema: quer dizer "o usuário
  escolheu azul".
- `MARKER_CLASS_BY_TONE` (`NotificationItem.tsx`) — `info`, `success` e
  `warning` são a categoria do aviso, não um papel do tema. `neutral` e `danger`
  **usam** token (`bg-primary`, `bg-destructive`), porque esses dois existem no
  tema.

Nesses dois casos, duas obrigações:

1. O mapa vive num `Record` nomeado, num `utils/` ou constante de módulo — nunca
   uma classe crua solta no meio do JSX.
2. O par claro/escuro é explícito (`dark:`), porque fora do token nada ajusta a
   cor por tema. É a única situação em que `dark:` na classe é correto.

Em dúvida: a cor responde a "que papel isso tem na interface?" → token. Responde
a "qual valor o usuário escolheu / de que tipo é este item?" → paleta crua, com
as duas regras acima.

- Tema escuro é automático pelos tokens — não escreva `dark:` em cada classe,
  fora da exceção acima.
- Prefira borda a sombra para destacar.
- Espaçamento com `gap-4` / `gap-6`.
- Conflito de classe: use `cn()` de `@/shared/lib/utils`
  (`import { cn } from '@/shared/lib/utils'`), que resolve via `clsx` + `tailwind-merge`.
  É o caminho que `components.json` aponta em `aliases.utils` — o `pnpm ui:add`
  importa daí. Não instale o pacote `cn`: ele embute um compilador em runtime
  (~42 kB no bundle) para fazer o que estas duas libs já fazem.

## Mobile first — sempre

A classe **sem prefixo é o celular**. Breakpoint (`sm:`, `md:`, `lg:`) só
**acrescenta** o que a tela maior comporta. Nunca escreva o desktop primeiro para
depois consertar no pequeno com `max-*`.

```tsx
// RUIM — desktop primeiro, celular remendado
<div className="grid grid-cols-3 max-sm:grid-cols-1">
<div className="p-8 max-md:p-3">

// BOM — celular primeiro, telas maiores acrescentam
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
<div className="p-3 md:p-8">
```

Regras práticas:

- Comece toda tela nova pelo layout de uma coluna; empilhe com `flex-col` e suba
  para `sm:flex-row` quando couber.
- Padding e gap crescem com a tela (`px-3 sm:px-5`), nunca diminuem.
- Tabela é o caso clássico: no celular falta espaço **horizontal**, então o
  respiro lateral entra a partir do `sm`. O container leva `overflow-x-auto`.
- Alvo de toque tem no mínimo 44px no celular — botão só com ícone usa `size-11`
  ou área clicável equivalente.
- `hidden sm:table-cell` esconde coluna secundária no celular; não encolha a
  fonte para caber tudo.
- Antes de entregar, confira a 375px de largura: nada de rolagem horizontal na
  página (dentro da tabela, tudo bem).

## Acessibilidade

- Todo input com `Label` associado (`htmlFor` / `id`).
- Erro de campo com `role="alert"` e `aria-describedby`.
- Botão só com ícone precisa de `aria-label`.
- `aria-invalid` no input com erro — o shadcn já estiliza esse estado.
