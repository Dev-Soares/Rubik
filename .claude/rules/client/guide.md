---
globs: client/**
---

# Aba "Como usar" — documentação obrigatória

Toda feature nova que o usuário enxerga **precisa** de uma seção no guia antes de
ser considerada concluída. Feature entregue sem seção é feature incompleta.

O conteúdo mora em `client/src/modules/guide/types/guideContent.ts`. É estático,
versionado junto com o código — não existe CRUD nem endpoint para isso.

## O que exige seção

- Aba nova na sidebar (`NAV_ITEMS` ou `NAV_FOOTER_ITEMS`).
- Fluxo novo dentro de uma aba existente (ex: um novo dialog de importação).
  Neste caso, **não** crie seção: adicione um passo à seção da aba.

Não exige: refactor, correção de bug, ajuste visual, mudança que o usuário não
percebe.

## Como escrever a seção

```typescript
{
  id: 'relatorios',              // kebab-case, vira ?section=relatorios
  group: 'Administração',        // categoria do índice; reuse uma existente
  label: 'Relatórios',           // texto do índice, curto
  title: 'Relatórios',
  description: 'Uma linha sobre o que a aba resolve.',
  icon: FileTextIcon,            // o MESMO ícone usado em NAV_ITEMS
  to: '/admin/reports',          // habilita o botão "Abrir aba"
  screen: 'admin.reports',       // a MESMA chave de NAV_ITEMS
  role: 'admin',
  steps: [...],
  note: {...},                   // opcional
}
```

`screen` e `role` são obrigatórios sempre que a aba for restrita: o guia filtra
pela mesma regra da sidebar (`useGuideSections`), e sem eles a seção vaza para
quem não acessa a tela.

Passo que descreve algo restrito dentro de uma seção aberta também leva
`screen`/`role` — ver o passo de Administração em "Visão geral do sistema".

## Regras do texto

- **pt-BR**, tratando o leitor por "você".
- Passo é ação, não descrição de tela: "Clique em Novo usuário e preencha…",
  não "A tela possui um botão".
- 3 a 5 passos por seção. Mais que isso, a feature provavelmente vira duas.
- Descreva o que o usuário vê e faz — nunca nome de componente, rota, tabela ou
  campo do banco.
- `note` é para a pegadinha da tela (o que confunde, o que não dá para desfazer),
  não para repetir um passo.

## Ao mudar uma feature existente

Alterou fluxo, renomeou botão ou mudou a ordem das etapas? Atualize os passos da
seção correspondente no mesmo commit. Guia desatualizado é pior que guia ausente.
