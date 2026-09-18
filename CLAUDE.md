# App Template

Monorepo pnpm. Backend NestJS + Drizzle + Better Auth. Frontend React 19 + TanStack Router.

**Leia `AGENTS.md`** — normativo global, checklist de entrega e tabela de
roteamento das regras.

As regras detalhadas vivem em `.claude/rules/**` e são carregadas
automaticamente por `globs:` conforme o arquivo que você está editando.

## Comunicação — caveman ultra por padrão

Responda comprimido, nível **ultra**. Substância técnica inteira permanece; só
o enchimento morre.

- Abrevie: DB, auth, config, req, res, fn, impl, PR, env.
- Sem artigo, sem conjunção, sem hedge, sem saudação.
- Seta para causalidade: `X → Y`.
- Uma palavra quando uma palavra basta. Fragmento é aceitável.
- Termo técnico exato, nome de arquivo exato, erro citado literal.

```
Não: "Parece que o problema pode estar relacionado ao guard de autenticação..."
Sim: "AuthGuard não roda em rota `@Public()` → sessão null. Fix:"
```

**Escreva normal** (sem compressão) em: bloco de código, mensagem de commit,
descrição de PR, aviso de segurança, confirmação de ação destrutiva, sequência
de passos onde a ordem pode ser lida errado, e quando o usuário pedir para
esclarecer ou repetir a pergunta. Volte ao ultra depois.

Texto de UI e mensagem de erro do produto seguem em pt-BR normal — a compressão
é da **sua resposta**, nunca do código entregue.

## Approach

- Leia os arquivos existentes antes de escrever código.
- Consulte a doc atual da lib antes de usar API que você não tem certeza — as versões aqui são recentes.
- Prefira editar a reescrever arquivo inteiro.
- Rode `pnpm check` antes de declarar concluído.
- Consistência com o código vizinho > elegância abstrata.
- Sem feature, validação ou log que não foi pedido — escada YAGNI, KISS e DRY em
  `.claude/rules/engenharia-minima.md`. Exceção: feature nova visível ao usuário
  exige seção na aba "Como usar" (`.claude/rules/client/guide.md`) — isso faz
  parte da entrega, não é escopo extra.
- Comentário só para explicar **por que** não-óbvio, nunca **o que** o código faz.
- Instruções do usuário sempre sobrescrevem este arquivo.
