# App Template

Monorepo pnpm. Backend NestJS + Drizzle + Better Auth. Frontend React 19 + TanStack Router.

**Leia `AGENTS.md`** — normativo global, checklist de entrega e tabela de
roteamento das regras.

As regras detalhadas vivem em `.claude/rules/**` e são carregadas
automaticamente por `globs:` conforme o arquivo que você está editando.

## Approach

- Leia os arquivos existentes antes de escrever código.
- Consulte a doc atual da lib antes de usar API que você não tem certeza — as versões aqui são recentes.
- Prefira editar a reescrever arquivo inteiro.
- Rode `pnpm check` antes de declarar concluído.
- Consistência com o código vizinho > elegância abstrata.
- Sem feature, validação ou log que não foi pedido. Exceção: feature nova visível
  ao usuário exige seção na aba "Como usar" (`.claude/rules/client/guide.md`) —
  isso faz parte da entrega, não é escopo extra.
- Comentário só para explicar **por que** não-óbvio, nunca **o que** o código faz.
- Instruções do usuário sempre sobrescrevem este arquivo.
